import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_DESIGN_PRESET_ID, getDesignPresetById } from '@/lib/designPresets';

export const useDesignPresetId = () =>
  useQuery({
    queryKey: ['settings', 'design_preset'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'design_preset')
        .maybeSingle();
      return data?.value || DEFAULT_DESIGN_PRESET_ID;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useDesignPreset = () => {
  const { data: id } = useDesignPresetId();
  return getDesignPresetById(id);
};
