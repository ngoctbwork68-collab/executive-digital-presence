import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesAPI, type ActivityInsert, type ActivityUpdate } from '@/lib/supabase/activities';
import { toast } from 'sonner';

export const usePublishedActivities = () => {
  return useQuery({
    queryKey: ['activities', 'published'],
    queryFn: () => activitiesAPI.getPublishedActivities(),
  });
};

export const useFeaturedActivities = (limit?: number) => {
  return useQuery({
    queryKey: ['activities', 'featured', limit],
    queryFn: () => activitiesAPI.getFeaturedActivities(limit),
  });
};

export const useAllActivities = () => {
  return useQuery({
    queryKey: ['activities', 'all'],
    queryFn: () => activitiesAPI.getAllActivities(),
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => activitiesAPI.getActivity(id),
    enabled: !!id,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activity: ActivityInsert) => activitiesAPI.createActivity(activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create activity: ${error.message}`);
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ActivityUpdate }) =>
      activitiesAPI.updateActivity(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update activity: ${error.message}`);
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activitiesAPI.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete activity: ${error.message}`);
    },
  });
};

export const useToggleActivityPublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      activitiesAPI.togglePublished(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

export const useToggleActivityFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      activitiesAPI.toggleFeatured(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity featured status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update featured status: ${error.message}`);
    },
  });
};
