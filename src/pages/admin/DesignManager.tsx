import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Palette, Eye, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DESIGN_PRESETS,
  DEFAULT_DESIGN_PRESET_ID,
  applyDesignPreset,
  getDesignPresetById,
  type DesignPreset,
} from '@/lib/designPresets';
import { applyColorTheme } from '@/lib/colorThemes';
import { useTheme } from '@/lib/theme';
import { useDesignPresetId } from '@/hooks/useDesignPreset';

const PresetMock = ({ preset }: { preset: DesignPreset }) => {
  const [ink, gold, paper, surface] = preset.swatches;
  const radius =
    preset.id === 'architect' ? '0px' : preset.id === 'archival' ? '2px' : preset.id === 'editorial' ? '4px' : '10px';
  const headingFont = preset.fonts?.heading || "'Plus Jakarta Sans', sans-serif";
  const bodyFont = preset.fonts?.body || "'Inter', sans-serif";

  return (
    <div
      className="overflow-hidden border"
      style={{ background: paper, borderColor: `${ink}20`, borderRadius: radius, fontFamily: bodyFont }}
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ background: ink, color: paper }}>
        <span className="text-[9px] font-semibold tracking-[0.25em] uppercase">Portfolio</span>
        <div className="flex gap-2 text-[8px] opacity-70">
          <span>Home</span><span>About</span><span>Blog</span>
        </div>
      </div>
      <div className="px-4 py-5">
        <p className="text-[8px] uppercase tracking-[0.3em] mb-2" style={{ color: gold }}>
          {preset.tagline}
        </p>
        <p className="leading-none mb-3" style={{ fontFamily: headingFont, color: ink, fontSize: 26 }}>
          Trần Bảo Ngọc
        </p>
        <div className="h-px w-16 mb-3" style={{ background: gold }} />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="p-2"
              style={{
                background: surface,
                border: `1px solid ${ink}18`,
                borderRadius: radius,
                boxShadow: preset.id === 'classic' ? `0 6px 16px -10px ${ink}66` : 'none',
              }}
            >
              <div className="h-6 mb-1.5" style={{ background: `${ink}12`, borderRadius: radius }} />
              <div className="h-1 w-3/4 mb-1" style={{ background: `${ink}44` }} />
              <div className="h-1 w-1/2" style={{ background: `${ink}22` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 text-[8px]" style={{ background: ink, color: `${paper}aa` }}>
        © 2026 — {preset.name}
      </div>
    </div>
  );
};

export default function DesignManager() {
  const queryClient = useQueryClient();
  const { theme: darkMode } = useTheme();
  const { data: savedId } = useDesignPresetId();
  const [selected, setSelected] = useState<string>(DEFAULT_DESIGN_PRESET_ID);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (savedId) setSelected(savedId);
  }, [savedId]);

  /** Xem thử ngay trên trình duyệt mà chưa lưu */
  const previewPreset = (id: string) => {
    const preset = getDesignPresetById(id);
    applyDesignPreset(id);
    if (preset.colors) applyColorTheme('custom', darkMode === 'dark', preset.colors);
    toast.info('Đang xem thử — mở tab trang chủ để xem toàn bộ. Nhấn Lưu để áp dụng vĩnh viễn.');
  };

  const resetPreview = () => {
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    applyDesignPreset(savedId || DEFAULT_DESIGN_PRESET_ID);
    setSelected(savedId || DEFAULT_DESIGN_PRESET_ID);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'design_preset', value: selected }, { onConflict: 'key' });
    setSaving(false);
    if (error) {
      toast.error('Không lưu được: ' + error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    applyDesignPreset(selected);
    const preset = getDesignPresetById(selected);
    if (preset.colors) applyColorTheme('custom', darkMode === 'dark', preset.colors);
    toast.success(`Đã áp dụng bộ giao diện “${preset.name}” cho toàn bộ website`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shrink-0">
          <Palette size={22} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Bộ giao diện</h1>
          <p className="text-muted-foreground mt-1">
            Chọn một layout tổng thể cho toàn bộ trang công khai. Mỗi bộ thay đổi bảng màu, font chữ, bo góc và
            cách trình bày các khối nội dung. Trang quản trị không bị ảnh hưởng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {DESIGN_PRESETS.map((preset) => {
          const isSelected = selected === preset.id;
          const isActive = savedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelected(preset.id)}
              className={cn(
                'text-left bg-card border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl',
                isSelected ? 'border-primary ring-2 ring-primary/30 shadow-lg' : 'border-border'
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg text-foreground">{preset.name}</h2>
                    {isActive && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        Đang dùng
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">{preset.tagline}</p>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                    isSelected ? 'bg-primary border-primary' : 'border-border'
                  )}
                >
                  {isSelected && <Check size={14} className="text-primary-foreground" />}
                </div>
              </div>

              <PresetMock preset={preset} />

              <p className="text-sm text-muted-foreground mt-4">{preset.description}</p>

              <ul className="mt-3 space-y-1">
                {preset.traits.map((t) => (
                  <li key={t} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-secondary" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1.5">
                  {preset.swatches.map((c) => (
                    <span key={c} className="w-5 h-5 rounded-md border border-border" style={{ background: c }} />
                  ))}
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); previewPreset(preset.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); previewPreset(preset.id); } }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  <Eye size={14} /> Xem thử
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 bg-card/95 backdrop-blur border border-border rounded-2xl p-4 shadow-lg">
        <Button onClick={save} disabled={saving || selected === savedId}>
          {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
          Lưu & áp dụng
        </Button>
        <Button variant="outline" onClick={resetPreview}>
          <RotateCcw size={16} className="mr-2" /> Hoàn tác xem thử
        </Button>
        <p className="text-xs text-muted-foreground">
          Bộ giao diện có bảng màu và font riêng sẽ ghi đè lựa chọn trong mục Cài đặt. Chọn “Hiện tại (Classic)” để
          quay lại dùng Cài đặt.
        </p>
      </div>
    </div>
  );
}
