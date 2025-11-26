import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaAPI, type MediaItemInsert } from '@/lib/supabase/media';
import { toast } from 'sonner';

export const useAllMedia = () => {
  return useQuery({
    queryKey: ['media'],
    queryFn: () => mediaAPI.getAllMedia(),
  });
};

export const useMediaByType = (fileType: string) => {
  return useQuery({
    queryKey: ['media', fileType],
    queryFn: () => mediaAPI.getMediaByType(fileType),
    enabled: !!fileType,
  });
};

export const useCreateMediaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (media: MediaItemInsert) => mediaAPI.createMediaItem(media),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media item created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create media item: ${error.message}`);
    },
  });
};

export const useUpdateMediaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MediaItemInsert> }) =>
      mediaAPI.updateMediaItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update media item: ${error.message}`);
    },
  });
};

export const useDeleteMediaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaAPI.deleteMediaItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete media item: ${error.message}`);
    },
  });
};
