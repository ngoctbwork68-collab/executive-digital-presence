import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experiencesAPI, type ExperienceInsert, type ExperienceUpdate } from '@/lib/supabase/experiences';
import { toast } from 'sonner';

export const usePublishedExperiences = () => {
  return useQuery({
    queryKey: ['experiences', 'published'],
    queryFn: () => experiencesAPI.getPublishedExperiences(),
  });
};

export const useAllExperiences = () => {
  return useQuery({
    queryKey: ['experiences', 'all'],
    queryFn: () => experiencesAPI.getAllExperiences(),
  });
};

export const useExperience = (id: string) => {
  return useQuery({
    queryKey: ['experiences', id],
    queryFn: () => experiencesAPI.getExperience(id),
    enabled: !!id,
  });
};

export const useCreateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (experience: ExperienceInsert) => experiencesAPI.createExperience(experience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create experience: ${error.message}`);
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExperienceUpdate }) =>
      experiencesAPI.updateExperience(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update experience: ${error.message}`);
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => experiencesAPI.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete experience: ${error.message}`);
    },
  });
};

export const useToggleExperiencePublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      experiencesAPI.togglePublished(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      toast.success('Experience status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};
