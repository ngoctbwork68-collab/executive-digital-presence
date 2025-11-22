import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Activity = Tables<'activities'>;
export type ActivityInsert = TablesInsert<'activities'>;
export type ActivityUpdate = TablesUpdate<'activities'>;

export const activitiesAPI = {
  // Get all published activities (public)
  async getPublishedActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get featured activities (public)
  async getFeaturedActivities(limit: number = 4) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get all activities (admin)
  async getAllActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single activity
  async getActivity(id: string) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create activity
  async createActivity(activity: ActivityInsert) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update activity
  async updateActivity(id: string, updates: ActivityUpdate) {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete activity
  async deleteActivity(id: string) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle published status
  async togglePublished(id: string, published: boolean) {
    return this.updateActivity(id, { published });
  },

  // Toggle featured status
  async toggleFeatured(id: string, featured: boolean) {
    return this.updateActivity(id, { featured });
  },
};
