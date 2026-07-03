import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PAGE_KEYS = [
  'page_about', 'page_projects',
  'page_blog', 'page_contact', 'page_store',
];

const KEY_TO_PATH: Record<string, string> = {
  page_about: '/about',
  page_projects: '/projects',
  page_blog: '/blog',
  page_contact: '/contact',
  page_store: '/store',
};

export const normalizeHiddenPages = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (value instanceof Set) {
    return Array.from(value).filter((item): item is string => typeof item === 'string');
  }

  if (value && typeof value === 'object') {
    return Object.values(value).filter((item): item is string => typeof item === 'string');
  }

  return [];
};

export const usePageVisibility = () => {
  return useQuery({
    queryKey: ['page_visibility'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', PAGE_KEYS);
      if (error) throw error;

      const hidden: string[] = [];
      data?.forEach(item => {
        if (item.value === 'hidden') {
          const path = KEY_TO_PATH[item.key];
          if (path) hidden.push(path);
        }
      });
      return hidden;
    },
    select: normalizeHiddenPages,
    staleTime: 30_000,
  });
};
