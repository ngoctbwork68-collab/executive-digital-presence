import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profile'>;
export type ProfileInsert = TablesInsert<'profile'>;
export type ProfileUpdate = TablesUpdate<'profile'>;

export const profileAPI = {
  // Get the single profile
  async getProfile() {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Create profile
  async createProfile(profile: ProfileInsert) {
    const { data, error } = await supabase
      .from('profile')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update profile
  async updateProfile(id: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profile')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete profile
  async deleteProfile(id: string) {
    const { error } = await supabase
      .from('profile')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
