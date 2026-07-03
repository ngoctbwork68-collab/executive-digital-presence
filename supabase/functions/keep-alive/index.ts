// Keep-alive edge function
// - Reads keepalive_urls from `settings` and pings each (server-side).
// - Touches DB via a light query.
// - Publicly invokable; safe (no writes, no secrets exposed).

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const url = `${SUPABASE_URL}/rest/v1/settings?select=key,value&key=in.(${keys.join(",")})`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
  });
  const rows = (await res.json()) as Array<{ key: string; value: string }>;
  const map: Record<string, string> = {};
  rows.forEach((r) => (map[r.key] = r.value ?? ""));
  return map;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const map = await getSettings(["keepalive_enabled", "keepalive_urls"]);
    const enabled = (map.keepalive_enabled ?? "true") !== "false";
    if (!enabled) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }
    const urls = (map.keepalive_urls || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const results = await Promise.allSettled(
      urls.map((u) =>
        fetch(u, { method: "GET", headers: { "user-agent": "keep-alive-bot/1.0" } })
      )
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;

    return new Response(
      JSON.stringify({ ok: true, pinged: ok, total: urls.length, ts: new Date().toISOString() }),
      { headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
