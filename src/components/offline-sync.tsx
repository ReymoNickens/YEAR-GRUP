"use client";
import { useEffect, useState } from "react";
import { hubAct as serverAct } from "@/lib/hub/api";
import { dismissFailed, failed, flush, onQueueChange, queued } from "@/lib/offline-queue";

/**
 * Registers the service worker, sends what is waiting when the connection
 * returns, and tells the member plainly what is happening.
 */
export function OfflineSync() {
  const [online, setOnline] = useState(true);
  const [waiting, setWaiting] = useState(0);
  const [lost, setLost] = useState<{ type: string; message: string }[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const refresh = () => { setWaiting(queued().length); setLost(failed()); };
    const send = async () => {
      if (navigator.onLine === false || queued().length === 0) return refresh();
      await flush((payload) => serverAct({ data: payload as never }));
      refresh();
    };
    const up = () => { setOnline(true); void send(); };
    const down = () => setOnline(false);
    // navigator is only readable after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnline(navigator.onLine !== false);
    refresh();
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    const stop = onQueueChange(refresh);
    const timer = window.setInterval(send, 30_000);
    void send();
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
      stop();
      window.clearInterval(timer);
    };
  }, []);

  if (online && waiting === 0 && lost.length === 0) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md rounded-3xl border border-line bg-card p-4 text-sm shadow-lg">
      {!online ? <p>You are offline. You can keep reading what you last saw. Anything you write is saved and will send when you are back. A gift needs a connection.</p> : null}
      {waiting > 0 ? <p>{waiting} {waiting === 1 ? "thing is" : "things are"} waiting to send.</p> : null}
      {lost.map((f, i) => <p key={i} className="text-crimson">One {f.type} could not be sent: {f.message}</p>)}
      {lost.length > 0 ? <button type="button" className="mt-2 h-10 text-muted" onClick={() => { dismissFailed(); setLost([]); }}>Dismiss</button> : null}
    </div>
  );
}
