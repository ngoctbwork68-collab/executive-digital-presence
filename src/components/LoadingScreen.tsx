import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "loading-screen-config-v1";

export type LoadingConfig = {
  bg_url?: string;
  logo_url?: string;
  title?: string;
  subtitle?: string;
  style?: "ring" | "dots" | "wave" | "pulse";
  overlay?: number; // 0-100
  accent?: string; // hex
};

const DEFAULTS: LoadingConfig = {
  title: "Đang tải nội dung…",
  subtitle: "Vui lòng chờ trong giây lát",
  style: "ring",
  overlay: 60,
};

const readCache = (): LoadingConfig => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
};

export const writeLoadingCache = (cfg: LoadingConfig) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cfg));
  } catch {}
};

export const LOADING_KEYS = [
  "loading_bg_url",
  "loading_logo_url",
  "loading_title",
  "loading_subtitle",
  "loading_style",
  "loading_overlay",
  "loading_accent",
];

export const fetchLoadingConfig = async (): Promise<LoadingConfig> => {
  const { data } = await supabase.from("settings").select("key,value").in("key", LOADING_KEYS);
  const map: Record<string, string> = {};
  data?.forEach((r: any) => (map[r.key] = r.value || ""));
  const cfg: LoadingConfig = {
    bg_url: map.loading_bg_url || undefined,
    logo_url: map.loading_logo_url || undefined,
    title: map.loading_title || DEFAULTS.title,
    subtitle: map.loading_subtitle || DEFAULTS.subtitle,
    style: (map.loading_style as LoadingConfig["style"]) || DEFAULTS.style,
    overlay: map.loading_overlay ? Number(map.loading_overlay) : DEFAULTS.overlay,
    accent: map.loading_accent || undefined,
  };
  writeLoadingCache(cfg);
  return cfg;
};

const Spinner = ({ style, accent }: { style: LoadingConfig["style"]; accent?: string }) => {
  const color = accent || "hsl(var(--primary))";
  if (style === "dots") {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ background: color, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    );
  }
  if (style === "wave") {
    return (
      <div className="flex items-end gap-1 h-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-1.5 rounded-full animate-[wave_1s_ease-in-out_infinite]"
            style={{
              background: color,
              animationDelay: `${i * 0.12}s`,
              height: "100%",
            }}
          />
        ))}
        <style>{`@keyframes wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
      </div>
    );
  }
  if (style === "pulse") {
    return (
      <div className="relative w-16 h-16">
        <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: color }} />
        <span className="absolute inset-3 rounded-full" style={{ background: color }} />
      </div>
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-full border-4 border-white/20 animate-spin"
      style={{ borderTopColor: color }}
    />
  );
};

export default function LoadingScreen({
  fullscreen = false,
  override,
}: {
  fullscreen?: boolean;
  override?: LoadingConfig;
}) {
  const [cfg, setCfg] = useState<LoadingConfig>(() => override ?? readCache());

  useEffect(() => {
    if (override) {
      setCfg(override);
      return;
    }
    fetchLoadingConfig().then(setCfg).catch(() => {});
  }, [override]);

  const overlay = Math.max(0, Math.min(100, cfg.overlay ?? 60)) / 100;

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[9999] flex items-center justify-center"
          : "min-h-[60vh] w-full flex items-center justify-center relative overflow-hidden"
      }
      style={{
        background: cfg.bg_url
          ? `url("${cfg.bg_url}") center/cover no-repeat`
          : "linear-gradient(135deg, hsl(var(--primary)/0.08), hsl(var(--secondary)/0.05))",
      }}
    >
      {cfg.bg_url && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, rgba(10,15,30,${overlay}), rgba(10,15,30,${overlay * 0.7}))`,
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {cfg.logo_url ? (
          <img
            src={cfg.logo_url}
            alt="Logo"
            className="w-20 h-20 object-contain rounded-2xl shadow-2xl animate-[float_3s_ease-in-out_infinite]"
          />
        ) : null}

        <Spinner style={cfg.style} accent={cfg.accent} />

        {cfg.title && (
          <h2
            className={
              "text-lg md:text-xl font-semibold tracking-wide " +
              (cfg.bg_url ? "text-white drop-shadow-lg" : "text-foreground")
            }
          >
            {cfg.title}
          </h2>
        )}
        {cfg.subtitle && (
          <p className={"text-sm max-w-md " + (cfg.bg_url ? "text-white/80" : "text-muted-foreground")}>
            {cfg.subtitle}
          </p>
        )}
      </div>

      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}
