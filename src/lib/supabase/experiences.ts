import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Experience = Tables<'experiences'>;
export type ExperienceInsert = TablesInsert<'experiences'>;
export type ExperienceUpdate = TablesUpdate<'experiences'>;

export const experiencesAPI = {
  // Get all published experiences (public)
  async getPublishedExperiences() {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get all experiences (admin)
  async getAllExperiences() {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single experience
  async getExperience(id: string) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create experience
  async createExperience(experience: ExperienceInsert) {
    const { data, error } = await supabase
      .from('experiences')
      .insert(experience)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update experience
  async updateExperience(id: string, updates: ExperienceUpdate) {
    const { data, error } = await supabase
      .from('experiences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete experience
  async deleteExperience(id: string) {
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle published status
  async togglePublished(id: string, published: boolean) {
    return this.updateExperience(id, { published });
  },
};
