import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { toast } from "sonner";
import { Loader2, Save, Search, Globe, Activity } from "lucide-react";

export const SEO_KEYS = [
  "seo_title",
  "seo_description",
  "seo_keywords",
  "seo_og_image",
  "seo_favicon_url",
  "seo_canonical_base",
  "seo_ga_id",
  "seo_gsc_verification",
  "seo_robots",
  "keepalive_enabled",
  "keepalive_interval_min",
  "keepalive_urls",
];

type SeoCfg = {
  title: string;
  description: string;
  keywords: string;
  og_image: string;
  favicon_url: string;
  canonical_base: string;
  ga_id: string;
  gsc_verification: string;
  robots: string;
  keepalive_enabled: boolean;
  keepalive_interval_min: number;
  keepalive_urls: string;
};

const DEFAULTS: SeoCfg = {
  title: "Trần Bảo Ngọc - Portfolio",
  description: "Portfolio chuyên nghiệp của Trần Bảo Ngọc - Sales & Business Development",
  keywords: "Trần Bảo Ngọc, portfolio, sales, business development, Việt Nam",
  og_image: "",
  favicon_url: "",
  canonical_base: "https://baongoctran.id.vn",
  ga_id: "",
  gsc_verification: "",
  robots: "index, follow",
  keepalive_enabled: true,
  keepalive_interval_min: 10,
  keepalive_urls: "https://baongoctran.id.vn/",
};

export default function SeoManager() {
  const [cfg, setCfg] = useState<SeoCfg>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("key,value").in("key", SEO_KEYS);
      const map: Record<string, string> = {};
      data?.forEach((r: any) => (map[r.key] = r.value ?? ""));
      setCfg({
        title: map.seo_title || DEFAULTS.title,
        description: map.seo_description || DEFAULTS.description,
        keywords: map.seo_keywords || DEFAULTS.keywords,
        og_image: map.seo_og_image || "",
        favicon_url: map.seo_favicon_url || "",
        canonical_base: map.seo_canonical_base || DEFAULTS.canonical_base,
        ga_id: map.seo_ga_id || "",
        gsc_verification: map.seo_gsc_verification || "",
        robots: map.seo_robots || DEFAULTS.robots,
        keepalive_enabled: (map.keepalive_enabled ?? "true") !== "false",
        keepalive_interval_min: Number(map.keepalive_interval_min) || 10,
        keepalive_urls: map.keepalive_urls || DEFAULTS.keepalive_urls,
      });
      setLoading(false);
    })();
  }, []);

  const patch = (p: Partial<SeoCfg>) => setCfg((prev) => ({ ...prev, ...p }));

  const save = async () => {
    setSaving(true);
    try {
      const rows = [
        { key: "seo_title", value: cfg.title },
        { key: "seo_description", value: cfg.description },
        { key: "seo_keywords", value: cfg.keywords },
        { key: "seo_og_image", value: cfg.og_image },
        { key: "seo_favicon_url", value: cfg.favicon_url },
        { key: "seo_canonical_base", value: cfg.canonical_base },
        { key: "seo_ga_id", value: cfg.ga_id },
        { key: "seo_gsc_verification", value: cfg.gsc_verification },
        { key: "seo_robots", value: cfg.robots },
        { key: "keepalive_enabled", value: String(cfg.keepalive_enabled) },
        { key: "keepalive_interval_min", value: String(cfg.keepalive_interval_min) },
        { key: "keepalive_urls", value: cfg.keepalive_urls },
      ];
      const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast.success("Đã lưu cấu hình SEO & Keep-alive");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const pingNow = async () => {
    toast.info("Đang ping thử...");
    try {
      const { data, error } = await supabase.functions.invoke("keep-alive", {
        body: { manual: true },
      });
      if (error) throw error;
      toast.success(`Ping OK: ${data?.pinged ?? 0} URL`);
    } catch (e: any) {
      toast.error("Ping thất bại: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          SEO & Auto Keep-alive
        </h1>
        <p className="text-sm text-muted-foreground">
          Cấu hình meta tags cho Google, mạng xã hội và tự động ping để giữ website + Supabase luôn hoạt động.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-2 font-semibold">
            <Globe className="w-4 h-4 text-primary" /> Meta cơ bản
          </div>
          <div>
            <Label>Tiêu đề trang (title)</Label>
            <Input value={cfg.title} onChange={(e) => patch({ title: e.target.value })} maxLength={70} />
            <p className="text-xs text-muted-foreground mt-1">Khuyến nghị ≤ 60 ký tự. Hiện tại: {cfg.title.length}</p>
          </div>
          <div>
            <Label>Mô tả (description)</Label>
            <Textarea rows={3} value={cfg.description} onChange={(e) => patch({ description: e.target.value })} maxLength={200} />
            <p className="text-xs text-muted-foreground mt-1">Khuyến nghị ≤ 160 ký tự. Hiện tại: {cfg.description.length}</p>
          </div>
          <div>
            <Label>Từ khóa (keywords, cách nhau bằng dấu phẩy)</Label>
            <Input value={cfg.keywords} onChange={(e) => patch({ keywords: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Canonical base URL</Label>
              <Input value={cfg.canonical_base} onChange={(e) => patch({ canonical_base: e.target.value })} placeholder="https://baongoctran.id.vn" />
            </div>
            <div>
              <Label>Robots</Label>
              <Input value={cfg.robots} onChange={(e) => patch({ robots: e.target.value })} placeholder="index, follow" />
            </div>
          </div>
          <MediaUpload
            label="Ảnh chia sẻ mạng xã hội (og:image, 1200×630)"
            value={cfg.og_image}
            onChange={(url) => patch({ og_image: url })}
            accept="image/*"
            maxSizeMB={5}
          />
          <MediaUpload
            label="Favicon (32×32 hoặc 64×64, .png/.svg)"
            value={cfg.favicon_url}
            onChange={(url) => patch({ favicon_url: url })}
            accept="image/*"
            maxSizeMB={1}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Google Analytics ID (G-XXXXX)</Label>
              <Input value={cfg.ga_id} onChange={(e) => patch({ ga_id: e.target.value })} placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <Label>Google Search Console (meta content)</Label>
              <Input value={cfg.gsc_verification} onChange={(e) => patch({ gsc_verification: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Activity className="w-4 h-4 text-primary" /> Keep-alive tự động
            </div>
            <Switch checked={cfg.keepalive_enabled} onCheckedChange={(v) => patch({ keepalive_enabled: v })} />
          </div>
          <p className="text-sm text-muted-foreground">
            Tự động truy cập website theo lịch để Supabase không rơi vào trạng thái pause và giữ index Google luôn tươi.
            Chạy 2 lớp: <b>server-side cron</b> (pg_cron mỗi 5 phút) và <b>client-side</b> khi có tab đang mở.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Chu kỳ client-side (phút)</Label>
              <Input
                type="number"
                min={2}
                max={60}
                value={cfg.keepalive_interval_min}
                onChange={(e) => patch({ keepalive_interval_min: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={pingNow} className="w-full">
                <Activity className="w-4 h-4 mr-2" /> Ping thử ngay
              </Button>
            </div>
          </div>
          <div>
            <Label>Danh sách URL cần giữ sống (mỗi URL 1 dòng)</Label>
            <Textarea
              rows={4}
              value={cfg.keepalive_urls}
              onChange={(e) => patch({ keepalive_urls: e.target.value })}
              placeholder="https://baongoctran.id.vn/&#10;https://baongoctran.id.vn/about"
            />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10">
        <Button onClick={save} disabled={saving} size="lg" className="w-full shadow-lg">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Lưu tất cả
        </Button>
      </div>
    </div>
  );
}
