import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogAPI, type BlogPostInsert, type BlogPostUpdate, type BlogTagInsert } from '@/lib/supabase/blog';
import { toast } from 'sonner';

// === Blog Posts Hooks ===

export const usePublishedPosts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['blog-posts', 'published', page, limit],
    queryFn: () => blogAPI.getPublishedPosts(page, limit),
  });
};

export const useFeaturedPosts = (limit?: number) => {
  return useQuery({
    queryKey: ['blog-posts', 'featured', limit],
    queryFn: () => blogAPI.getFeaturedPosts(limit),
  });
};

export const usePostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: () => blogAPI.getPostBySlug(slug),
    enabled: !!slug,
  });
};

export const useSearchPosts = (query: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'search', query],
    queryFn: () => blogAPI.searchPosts(query),
    enabled: query.length > 2,
  });
};

export const usePostsByCategory = (category: string, language: 'en' | 'vi') => {
  return useQuery({
    queryKey: ['blog-posts', 'category', category, language],
    queryFn: () => blogAPI.getPostsByCategory(category, language),
    enabled: !!category,
  });
};

export const useAllPosts = () => {
  return useQuery({
    queryKey: ['blog-posts', 'all'],
    queryFn: () => blogAPI.getAllPosts(),
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: BlogPostInsert) => blogAPI.createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BlogPostUpdate }) =>
      blogAPI.updatePost(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogAPI.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};

export const useTogglePostPublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      blogAPI.togglePublished(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post status updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};

// === Blog Tags Hooks ===

export const useAllTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => blogAPI.getAllTags(),
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tag: BlogTagInsert) => blogAPI.createTag(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
      toast.success('Tag created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create tag: ${error.message}`);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogAPI.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete tag: ${error.message}`);
    },
  });
};

export const usePostsByTag = (tagId: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'tag', tagId],
    queryFn: () => blogAPI.getPostsByTag(tagId),
    enabled: !!tagId,
  });
};
