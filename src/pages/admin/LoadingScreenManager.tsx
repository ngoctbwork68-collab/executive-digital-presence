import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { toast } from "sonner";
import { Loader2, Save, Eye, Sparkles, Image as ImageIcon, Palette, Plus, Trash2, Check } from "lucide-react";
import LoadingScreen, {
  fetchLoadingConfig,
  writeLoadingCache,
  BUILTIN_PRESETS,
  fetchCustomPresets,
  fetchActivePresetId,
  type LoadingConfig,
  type LoadingPreset,
} from "@/components/LoadingScreen";

const STYLES: { id: NonNullable<LoadingConfig["style"]>; label: string; desc: string }[] = [
  { id: "ring", label: "Ring", desc: "Vòng xoay cổ điển" },
  { id: "dots", label: "Dots", desc: "3 chấm nhảy mềm mại" },
  { id: "wave", label: "Wave", desc: "Sóng thanh nhạc" },
  { id: "pulse", label: "Pulse", desc: "Nhịp đập lan tỏa" },
];

const uid = () => "p_" + Math.random().toString(36).slice(2, 9);

export default function LoadingScreenManager() {
  const [cfg, setCfg] = useState<LoadingConfig>({
    title: "Đang tải nội dung…",
    subtitle: "Vui lòng chờ trong giây lát",
    style: "ring",
    overlay: 60,
  });
  const [customPresets, setCustomPresets] = useState<LoadingPreset[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    Promise.all([fetchLoadingConfig(), fetchCustomPresets(), fetchActivePresetId()])
      .then(([c, presets, id]) => {
        setCfg((prev) => ({ ...prev, ...c }));
        setCustomPresets(presets);
        setActiveId(id);
      })
      .finally(() => setLoading(false));
  }, []);

  const patch = (p: Partial<LoadingConfig>) => setCfg((prev) => ({ ...prev, ...p }));

  const applyPreset = (preset: LoadingPreset) => {
    const { id, name, builtIn, ...rest } = preset;
    patch(rest);
    setActiveId(id);
    toast.success(`Đã chọn preset: ${name}`);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt("Tên preset mới:");
    if (!name) return;
    const newPreset: LoadingPreset = { id: uid(), name, ...cfg };
    setCustomPresets((p) => [...p, newPreset]);
    setActiveId(newPreset.id);
    toast.success("Đã tạo preset – nhớ bấm Lưu");
  };

  const deletePreset = (id: string) => {
    setCustomPresets((p) => p.filter((x) => x.id !== id));
    if (activeId === id) setActiveId("");
  };

  const save = async () => {
    setSaving(true);
    try {
      const rows = [
        { key: "loading_bg_url", value: cfg.bg_url || "" },
        { key: "loading_logo_url", value: cfg.logo_url || "" },
        { key: "loading_title", value: cfg.title || "" },
        { key: "loading_subtitle", value: cfg.subtitle || "" },
        { key: "loading_style", value: cfg.style || "ring" },
        { key: "loading_overlay", value: String(cfg.overlay ?? 60) },
        { key: "loading_accent", value: cfg.accent || "" },
        { key: "loading_active_preset", value: activeId || "" },
        { key: "loading_custom_presets", value: JSON.stringify(customPresets) },
      ];
      const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      writeLoadingCache(cfg);
      setPreviewKey((k) => k + 1);
      toast.success("Đã lưu Loading Screen");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const allPresets: LoadingPreset[] = [...BUILTIN_PRESETS, ...customPresets];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Trang Loading
        </h1>
        <p className="text-sm text-muted-foreground">
          Tùy biến màn hình chờ hiển thị khi đang tải dữ liệu từ database.
        </p>
      </div>

      {/* Preset picker */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Preset</h2>
              <p className="text-xs text-muted-foreground">Chọn nhanh một chủ đề có sẵn hoặc lưu cấu hình hiện tại thành preset riêng.</p>
            </div>
            <Button size="sm" variant="outline" onClick={saveCurrentAsPreset}>
              <Plus className="w-4 h-4 mr-1" /> Lưu preset hiện tại
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allPresets.map((p) => {
              const active = activeId === p.id;
              return (
                <div
                  key={p.id}
                  className={
                    "group relative p-4 rounded-xl border cursor-pointer transition-all " +
                    (active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40")
                  }
                  onClick={() => applyPreset(p)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{p.name}</div>
                    {active && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.title}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted">{p.style}</span>
                    {p.accent && (
                      <span className="w-3 h-3 rounded-full border" style={{ background: p.accent }} />
                    )}
                    {p.builtIn ? (
                      <span className="text-[10px] text-muted-foreground ml-auto">Mặc định</span>
                    ) : (
                      <button
                        className="ml-auto text-destructive/70 hover:text-destructive opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePreset(p.id);
                        }}
                        title="Xóa preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
        {/* Editor */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ImageIcon className="w-4 h-4 text-primary" /> Hình ảnh
              </div>
              <MediaUpload
                label="Ảnh nền loading (khuyên dùng 1920×1080, .jpg/.webp)"
                value={cfg.bg_url || ""}
                onChange={(url) => patch({ bg_url: url })}
                accept="image/*"
                maxSizeMB={8}
              />
              <MediaUpload
                label="Logo hiển thị giữa màn hình (tùy chọn, nền trong suốt .png)"
                value={cfg.logo_url || ""}
                onChange={(url) => patch({ logo_url: url })}
                accept="image/*"
                maxSizeMB={3}
              />
              <div>
                <Label>Độ tối lớp phủ (overlay) — {cfg.overlay}%</Label>
                <Slider
                  value={[cfg.overlay ?? 60]}
                  min={0}
                  max={90}
                  step={5}
                  onValueChange={(v) => patch({ overlay: v[0] })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Overlay tối giúp chữ nổi rõ trên ảnh nền.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Palette className="w-4 h-4 text-primary" /> Hiệu ứng
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => patch({ style: s.id })}
                    className={
                      "text-left p-3 rounded-xl border transition-all " +
                      (cfg.style === s.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40")
                    }
                  >
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </button>
                ))}
              </div>
              <div>
                <Label>Màu nhấn (hex, tùy chọn)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={cfg.accent || "#d4a017"}
                    onChange={(e) => patch({ accent: e.target.value })}
                    className="w-16 p-1 h-10"
                  />
                  <Input
                    value={cfg.accent || ""}
                    onChange={(e) => patch({ accent: e.target.value })}
                    placeholder="Bỏ trống = theo theme"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tiêu đề</Label>
              <Input value={cfg.title || ""} onChange={(e) => patch({ title: e.target.value })} />
              <Label>Phụ đề</Label>
              <Textarea
                rows={2}
                value={cfg.subtitle || ""}
                onChange={(e) => patch({ subtitle: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu thay đổi
              </Button>
              <Button variant="outline" onClick={() => setPreviewKey((k) => k + 1)}>
                <Eye className="w-4 h-4 mr-2" />
                Xem lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card className="overflow-hidden sticky top-4 h-fit">
          <div className="p-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Xem trước trực tiếp
          </div>
          <div key={previewKey} className="h-[520px] relative">
            <PreviewInline cfg={cfg} />
          </div>
        </Card>
      </div>
    </div>
  );
}

const PreviewInline = ({ cfg }: { cfg: LoadingConfig }) => (
  <LoadingScreen override={cfg} />
);
