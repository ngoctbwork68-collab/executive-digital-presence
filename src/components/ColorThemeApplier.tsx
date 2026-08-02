import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { applyColorTheme, type CustomColors } from '@/lib/colorThemes';
import { useTheme } from '@/lib/theme';
import { useDesignPreset } from '@/hooks/useDesignPreset';

const ColorThemeApplier = () => {
  const { theme: darkMode } = useTheme();
  const preset = useDesignPreset();


  const { data: colorThemeId } = useQuery({
    queryKey: ['settings', 'color_theme'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'color_theme')
        .maybeSingle();
      return data?.value || 'navy-gold';
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: customColorsRaw } = useQuery({
    queryKey: ['settings', 'custom_theme_colors'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'custom_theme_colors')
        .maybeSingle();
      return data?.value || null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: colorThemeId === 'custom',
  });

  useEffect(() => {
    // Bộ giao diện (design preset) có bảng màu riêng thì ưu tiên nó
    if (preset.colors) {
      applyColorTheme('custom', darkMode === 'dark', preset.colors);
      return;
    }
    if (!colorThemeId) return;
    let customColors: CustomColors | undefined;
    if (colorThemeId === 'custom' && customColorsRaw) {
      try {
        customColors = JSON.parse(customColorsRaw);
      } catch { /* ignore */ }
    }
    applyColorTheme(colorThemeId, darkMode === 'dark', customColors);
  }, [colorThemeId, darkMode, customColorsRaw, preset]);


  return null;
};

export default ColorThemeApplier;
