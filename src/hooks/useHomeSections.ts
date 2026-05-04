import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type HomeSectionId = 'stats' | 'projects' | 'testimonials' | 'blog' | 'cta' | 'custom';

export const DEFAULT_HOME_SECTIONS: HomeSectionId[] = ['stats', 'projects', 'testimonials', 'blog', 'cta', 'custom'];

export const SECTION_LABELS: Record<HomeSectionId, string> = {
  stats: 'Thống kê (Stats)',
  projects: 'Dự án nổi bật',
  testimonials: 'Lời nhận xét',
  blog: 'Bài viết mới',
  cta: 'Kêu gọi hành động (CTA)',
  custom: 'Custom Sections (trang Home)',
};

export type HomeSectionsVisibility = Record<HomeSectionId, boolean>;

export const DEFAULT_VISIBILITY: HomeSectionsVisibility = {
  stats: true, projects: true, testimonials: true, blog: true, cta: true, custom: true,
};

export const useHomeSectionsOrder = () => {
  return useQuery({
    queryKey: ['home_sections_order'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'home_sections_order').maybeSingle();
      try {
        const parsed = data?.value ? JSON.parse(data.value) : null;
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((x: string) => DEFAULT_HOME_SECTIONS.includes(x as HomeSectionId)) as HomeSectionId[];
          const missing = DEFAULT_HOME_SECTIONS.filter(x => !valid.includes(x));
          return [...valid, ...missing];
        }
      } catch {}
      return DEFAULT_HOME_SECTIONS;
    },
    staleTime: 60_000,
  });
};

export const useHomeSectionsVisibility = () => {
  return useQuery({
    queryKey: ['home_sections_visibility'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'home_sections_visibility').maybeSingle();
      try {
        const parsed = data?.value ? JSON.parse(data.value) : null;
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_VISIBILITY, ...parsed } as HomeSectionsVisibility;
        }
      } catch {}
      return DEFAULT_VISIBILITY;
    },
    staleTime: 60_000,
  });
};

export const useSaveHomeSectionsOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ order, visibility }: { order: HomeSectionId[]; visibility: HomeSectionsVisibility }) => {
      const { error: e1 } = await supabase.from('settings').upsert({ key: 'home_sections_order', value: JSON.stringify(order) }, { onConflict: 'key' });
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('settings').upsert({ key: 'home_sections_visibility', value: JSON.stringify(visibility) }, { onConflict: 'key' });
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home_sections_order'] });
      qc.invalidateQueries({ queryKey: ['home_sections_visibility'] });
      toast.success('Đã lưu thứ tự & hiển thị section');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
