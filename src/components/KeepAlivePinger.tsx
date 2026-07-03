import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side keep-alive: while any user has a tab open, periodically
 * (1) touches Supabase via a light query and
 * (2) pings the site so hosting/CDN stays warm.
 * Settings pulled from `settings` table: keepalive_enabled, keepalive_interval_min, keepalive_urls.
 */
export default function KeepAlivePinger() {
  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("settings")
        .select("key,value")
        .in("key", ["keepalive_enabled", "keepalive_interval_min", "keepalive_urls"]);
      const map: Record<string, string> = {};
      data?.forEach((r: any) => (map[r.key] = r.value ?? ""));
      const enabled = (map.keepalive_enabled ?? "true") !== "false";
      const interval = Math.max(2, Math.min(60, Number(map.keepalive_interval_min) || 10));
      const urls = (map.keepalive_urls || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      return { enabled, interval, urls };
    };

    const ping = async () => {
      try {
        // Touch DB (light) to prevent Supabase pause
        await supabase.from("settings").select("key").limit(1);
      } catch {}
      const { urls } = await load();
      urls.forEach((u) => {
        // no-cors so it works cross-origin and doesn't error
        fetch(u, { method: "GET", mode: "no-cors", cache: "no-store" }).catch(() => {});
      });
    };

    const start = async () => {
      const { enabled, interval } = await load();
      if (!enabled || cancelled) return;
      // fire once shortly after mount, then on interval
      window.setTimeout(ping, 15_000);
      timer = window.setInterval(ping, interval * 60 * 1000);
    };

    start();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return null;
}
