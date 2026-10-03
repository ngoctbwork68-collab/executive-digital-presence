import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;

export const projectsAPI = {
  async getPublishedProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published' as never, true as never)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getFeaturedProjects(limit: number = 3) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .eq('published' as never, true as never)
      .order('sort_order', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getProjectBySlug(slug: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async togglePublished(id: string, published: boolean) {
    return this.updateProject(id, { published } as ProjectUpdate);
  },

  async toggleFeatured(id: string, featured: boolean) {
    return this.updateProject(id, { featured });
  },
};
