"use client";
import { useEffect, useRef, useState } from "react";
import { isNetworkError } from "@/lib/offline-queue";

const PREFIX = "ygh:read:";
const MAX_BYTES = 200_000;

function remember(key: string, data: unknown) {
  try {
    const text = JSON.stringify({ at: Date.now(), data });
    if (text.length <= MAX_BYTES) localStorage.setItem(PREFIX + key, text);
  } catch {
    /* storage full or unavailable: reading simply is not saved */
  }
}
function recall<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as { data: T }).data : null;
  } catch {
    return null;
  }
}

/**
 * Load a screen's data. Each good result is kept on the device (cleared at
 * sign-out). A screen the member has seen before opens at once with what they
 * last saw, marked as refreshing, and the fresh copy replaces it when it lands.
 * On a slow or dropped connection that saved copy stays. Only reads are kept,
 * never anything that moves money.
 */
export function useHub<T>(key: string, load: () => Promise<T>) {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean; stale: boolean }>({
    data: null,
    error: "",
    loading: true,
    stale: false,
  });
  useEffect(() => {
    let live = true;
    const saved = recall<T>(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show the saved copy before the network answers
    setState(saved ? { data: saved, error: "", loading: false, stale: true } : { data: null, error: "", loading: true, stale: false });
    loadRef.current()
      .then((data) => {
        if (!live) return;
        remember(key, data);
        setState({ data, error: "", loading: false, stale: false });
      })
      .catch((e: unknown) => {
        if (!live) return;
        const offline = isNetworkError(e) || (typeof navigator !== "undefined" && navigator.onLine === false);
        if (offline && saved) return setState({ data: saved, error: "", loading: false, stale: true });
        const message = e instanceof Error ? e.message : "Something went wrong. Try again.";
        setState({ data: null, error: message, loading: false, stale: false });
      });
    return () => {
      live = false;
    };
  }, [key, tick]);
  return { ...state, reload: () => setTick((n) => n + 1) };
}
