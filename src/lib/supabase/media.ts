import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type MediaItem = Tables<'media_library'>;
export type MediaItemInsert = TablesInsert<'media_library'>;

export const mediaAPI = {
  // Get all media
  async getAllMedia() {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get media by type
  async getMediaByType(fileType: string) {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('file_type', fileType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create media item
  async createMediaItem(media: MediaItemInsert) {
    const { data, error } = await supabase
      .from('media_library')
      .insert(media)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update media item
  async updateMediaItem(id: string, updates: Partial<MediaItemInsert>) {
    const { data, error } = await supabase
      .from('media_library')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete media item
  async deleteMediaItem(id: string) {
    const { error } = await supabase
      .from('media_library')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
