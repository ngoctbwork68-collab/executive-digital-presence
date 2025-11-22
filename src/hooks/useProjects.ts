import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, type ProjectInsert, type ProjectUpdate } from '@/lib/supabase/projects';
import { toast } from 'sonner';

export const usePublishedProjects = () => {
  return useQuery({
    queryKey: ['projects', 'published'],
    queryFn: () => projectsAPI.getPublishedProjects(),
  });
};

export const useFeaturedProjects = (limit?: number) => {
  return useQuery({
    queryKey: ['projects', 'featured', limit],
    queryFn: () => projectsAPI.getFeaturedProjects(limit),
  });
};

export const useAllProjects = () => {
  return useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsAPI.getAllProjects(),
  });
};

export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['projects', 'slug', slug],
    queryFn: () => projectsAPI.getProjectBySlug(slug),
    enabled: !!slug,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsAPI.getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectInsert) => projectsAPI.createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProjectUpdate }) =>
      projectsAPI.updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsAPI.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });
};

export const useToggleProjectPublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      projectsAPI.togglePublished(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

export const useToggleProjectFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      projectsAPI.toggleFeatured(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project featured status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update featured status: ${error.message}`);
    },
  });
};
