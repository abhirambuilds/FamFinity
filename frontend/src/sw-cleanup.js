// Unregister any existing service workers and clear caches to avoid stale asset 404s
export async function cleanupServiceWorkersAndCaches() {
  if (typeof window === "undefined") return;
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) { await r.unregister(); }
    }
    if (window.caches && caches.keys) {
      const keys = await caches.keys();
      for (const k of keys) { await caches.delete(k); }
    }
    // Force a reload once (no infinite loops)
    const FLAG = "__famfinity_sw_cleanup_done__";
    if (!sessionStorage.getItem(FLAG)) {
      sessionStorage.setItem(FLAG, "1");
      window.location.reload();
    }
  } catch (e) {
    // no-op; best effort
    console.warn("SW cleanup failed", e);
  }
}
