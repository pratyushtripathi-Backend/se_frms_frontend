import { useEffect, useRef, useState } from "react";

// How often pages re-fetch in the background.
// LIVE: data that changes with every transaction (cases, decisions, scoring,
// audit trail, notifications, login activity).
// CONFIG: admin set-up data that changes rarely (rules, categories, scores,
// blacklist, users, roles, access, templates, decision policy).
export const LIVE_REFRESH_MS = 10000;
export const CONFIG_REFRESH_MS = 30000;

// Calls `refresh` every `intervalMs` while the browser tab is visible, and
// once right away when the user comes back to the tab.
//
// - Never stacks requests: a tick is skipped while the previous refresh is
//   still running.
// - `refresh` is read through a ref, so passing a new function each render
//   doesn't restart the timer.
// - `enabled: false` pauses it (e.g. while a "fetch every page" filter is
//   active, or before the user has searched).
//
// Pages' loaders already keep the current rows on screen when the page is
// cached (no dimming / spinner), so a background refresh just swaps in the
// new rows quietly.
export function useAutoRefresh(refresh, { intervalMs = LIVE_REFRESH_MS, enabled = true } = {}) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let isInFlight = false;

    const tick = async () => {
      if (document.visibilityState !== "visible" || isInFlight) return;

      isInFlight = true;
      try {
        await refreshRef.current?.();
      } catch {
        // Loaders handle their own errors; a failed background refresh just
        // keeps the rows already on screen.
      } finally {
        isInFlight = false;
      }
    };

    const intervalId = window.setInterval(tick, intervalMs);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, intervalMs]);
}

// For pages whose loader lives inside a useEffect (so it can't be called from
// outside): returns a counter that goes up every `intervalMs` while the tab is
// visible. Add it to that effect's dependency list and the effect re-runs,
// re-fetching the current page quietly from its cache path.
export function useRefreshTick(options) {
  const [tick, setTick] = useState(0);

  useAutoRefresh(() => setTick((value) => value + 1), options);

  return tick;
}
