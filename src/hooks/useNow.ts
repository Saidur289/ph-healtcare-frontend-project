"use client";
import { useEffect, useState } from "react";

// Current time for render logic (e.g. "can this call be joined yet?").
// Starts at 0 on the server and first client render (no hydration mismatch), then
// updates after mount and every `intervalMs`, so buttons appear when the time comes.
export const useNow = (intervalMs = 30_000) => {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [intervalMs]);
  return now;
};
