import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "loading-screen-config-v2";

export type LoadingConfig = {
  bg_url?: string;
  logo_url?: string;
  title?: string;
  subtitle?: string;
  style?: "ring" | "dots" | "wave" | "pulse";
  overlay?: number; // 0-100
  accent?: string; // hex
};

export type LoadingPreset = LoadingConfig & { id: string; name: string; builtIn?: boolean };

const DEFAULTS: LoadingConfig = {
  title: "Đang tải nội dung…",
  subtitle: "Vui lòng chờ trong giây lát",
  style: "ring",
  overlay: 60,
};

export const BUILTIN_PRESETS: LoadingPreset[] = [
  {
    id: "default",
    name: "Mặc định",
    builtIn: true,
    title: "Đang tải nội dung…",
    subtitle: "Vui lòng chờ trong giây lát",
    style: "ring",
    overlay: 55,
    accent: "#d4a017",
  },
  {
    id: "noel",
    name: "🎄 Noel",
    builtIn: true,
    title: "Merry Christmas ✨",
    subtitle: "Chúc bạn một mùa lễ ấm áp",
    style: "dots",
    overlay: 45,
    accent: "#e63946",
    bg_url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1920&q=80",
  },
  {
    id: "tet",
    name: "🧧 Tết",
    builtIn: true,
    title: "Chúc Mừng Năm Mới",
    subtitle: "An khang – Thịnh vượng – Vạn sự như ý",
    style: "pulse",
    overlay: 50,
    accent: "#facc15",
    bg_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=80",
  },
];

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
  "loading_active_preset",
  "loading_custom_presets",
];

export const fetchLoadingConfig = async (): Promise<LoadingConfig> => {
  const { data } = await supabase.from("settings").select("key,value").in("key", LOADING_KEYS);
  const map: Record<string, string> = {};
  data?.forEach((r: any) => (map[r.key] = r.value || ""));

  // If an active preset is set, resolve it (built-in or custom)
  const activeId = map.loading_active_preset;
  let base: LoadingConfig = { ...DEFAULTS };
  if (activeId) {
    const custom: LoadingPreset[] = safeParse(map.loading_custom_presets) || [];
    const all = [...BUILTIN_PRESETS, ...custom];
    const preset = all.find((p) => p.id === activeId);
    if (preset) base = { ...base, ...preset };
  }
  // Explicit field overrides always win
  const cfg: LoadingConfig = {
    ...base,
    bg_url: map.loading_bg_url || base.bg_url,
    logo_url: map.loading_logo_url || base.logo_url,
    title: map.loading_title || base.title,
    subtitle: map.loading_subtitle || base.subtitle,
    style: (map.loading_style as LoadingConfig["style"]) || base.style,
    overlay: map.loading_overlay ? Number(map.loading_overlay) : base.overlay,
    accent: map.loading_accent || base.accent,
  };
  writeLoadingCache(cfg);
  return cfg;
};

export const fetchCustomPresets = async (): Promise<LoadingPreset[]> => {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "loading_custom_presets")
    .maybeSingle();
  return safeParse(data?.value) || [];
};

export const fetchActivePresetId = async (): Promise<string> => {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "loading_active_preset")
    .maybeSingle();
  return data?.value || "";
};

const safeParse = (s?: string) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
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
      <div className="flex items-end gap-1 h-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-1.5 rounded-full animate-pulse"
            style={{
              background: color,
              height: `${40 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
    );
  }
  if (style === "pulse") {
    return (
      <div className="relative w-12 h-12">
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-60"
          style={{ background: color }}
        />
        <span className="absolute inset-2 rounded-full" style={{ background: color }} />
      </div>
    );
  }
  return (
    <div
      className="w-10 h-10 border-4 border-transparent rounded-full animate-spin"
      style={{ borderTopColor: color, borderRightColor: color }}
    />
  );
};

export default function LoadingScreen({ override }: { override?: LoadingConfig }) {
  const [cfg, setCfg] = useState<LoadingConfig>(() => (override ? { ...readCache(), ...override } : readCache()));

  useEffect(() => {
    if (override) {
      setCfg((c) => ({ ...c, ...override }));
      return;
    }
    fetchLoadingConfig().then(setCfg).catch(() => {});
  }, [override]);

  const overlayPct = Math.max(0, Math.min(90, cfg.overlay ?? 60)) / 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {cfg.bg_url ? (
        <img
          src={cfg.bg_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background" />
      )}
      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayPct})` }} />
      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
        {cfg.logo_url && (
          <img src={cfg.logo_url} alt="logo" className="w-20 h-20 object-contain drop-shadow-lg" />
        )}
        <Spinner style={cfg.style} accent={cfg.accent} />
        {cfg.title && (
          <h2 className="text-xl md:text-2xl font-semibold text-white drop-shadow-md">{cfg.title}</h2>
        )}
        {cfg.subtitle && (
          <p className="text-sm md:text-base text-white/85 max-w-md drop-shadow">{cfg.subtitle}</p>
        )}
      </div>
    </div>
  );
}
