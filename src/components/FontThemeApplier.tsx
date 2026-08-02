import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { applyFontTheme } from '@/lib/fontThemes';
import { useDesignPreset } from '@/hooks/useDesignPreset';

const FontThemeApplier = () => {
  const preset = useDesignPreset();

  const { data: fontThemeId } = useQuery({
    queryKey: ['settings', 'font_theme'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'font_theme')
        .maybeSingle();
      return data?.value || 'inter-lora';
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Preset có bộ font riêng -> để applyDesignPreset xử lý
    if (preset.fonts) return;
    if (fontThemeId) {
      applyFontTheme(fontThemeId);
    }
  }, [fontThemeId, preset]);


  return null;
};

export default FontThemeApplier;
