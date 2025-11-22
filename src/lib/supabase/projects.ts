import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;

export const projectsAPI = {
  // Get all published projects (public)
  async getPublishedProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get featured projects (public)
  async getFeaturedProjects(limit: number = 3) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get all projects (admin)
  async getAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single project by slug (public)
  async getProjectBySlug(slug: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get single project by ID (admin)
  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create project
  async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update project
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

  // Delete project
  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle published status
  async togglePublished(id: string, published: boolean) {
    return this.updateProject(id, { published });
  },

  // Toggle featured status
  async toggleFeatured(id: string, featured: boolean) {
    return this.updateProject(id, { featured });
  },
};
