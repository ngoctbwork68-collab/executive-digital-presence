import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Setting = Tables<'settings'>;
export type SettingInsert = TablesInsert<'settings'>;
export type SettingUpdate = TablesUpdate<'settings'>;

export const settingsAPI = {
  // Get all settings
  async getAllSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key');
    
    if (error) throw error;
    return data;
  },

  // Get setting by key
  async getSettingByKey(key: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Create or update setting
  async upsertSetting(setting: SettingInsert) {
    const { data, error } = await supabase
      .from('settings')
      .upsert(setting, { onConflict: 'key' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update setting
  async updateSetting(key: string, updates: SettingUpdate) {
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('key', key)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete setting
  async deleteSetting(key: string) {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('key', key);
    
    if (error) throw error;
  },
};
