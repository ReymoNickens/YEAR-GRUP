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
 * sign-out), so with no connection a screen the member has seen before still
 * opens with what they last saw. Only reads are kept, never anything that moves money.
 */
export function useHub<T>(key: string, load: () => Promise<T>) {
  const loadRef = useRef(load);
  loadRef.current = load;
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean; stale: boolean }>({
    data: null,
    error: "",
    loading: true,
    stale: false,
  });
  useEffect(() => {
    let live = true;
    setState({ data: null, error: "", loading: true, stale: false });
    loadRef.current()
      .then((data) => {
        if (!live) return;
        remember(key, data);
        setState({ data, error: "", loading: false, stale: false });
      })
      .catch((e: unknown) => {
        if (!live) return;
        const saved = isNetworkError(e) || (typeof navigator !== "undefined" && navigator.onLine === false) ? recall<T>(key) : null;
        if (saved) return setState({ data: saved, error: "", loading: false, stale: true });
        const message = e instanceof Error ? e.message : "Something went wrong. Try again.";
        setState({
          data: null,
          error: message === "Unauthorized" ? "Reload the page to pick up your session." : message,
          loading: false,
          stale: false,
        });
      });
    return () => {
      live = false;
    };
  }, [key]);
  return state;
}
