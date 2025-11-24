import { useQuery } from '@tanstack/react-query';
import { settingsAPI } from '@/lib/supabase/settings';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getAllSettings(),
  });
};

export const useSetting = (key: string) => {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => settingsAPI.getSettingByKey(key),
  });
};
