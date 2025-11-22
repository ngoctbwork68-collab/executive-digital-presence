import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type BlogPost = Tables<'blog_posts'>;
export type BlogPostInsert = TablesInsert<'blog_posts'>;
export type BlogPostUpdate = TablesUpdate<'blog_posts'>;

export type BlogTag = Tables<'blog_tags'>;
export type BlogTagInsert = TablesInsert<'blog_tags'>;

export const blogAPI = {
  // === Blog Posts ===
  
  // Get all published posts with pagination
  async getPublishedPosts(page: number = 1, limit: number = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('published_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return { posts: data, count: count || 0, hasMore: count ? to < count : false };
  },

  // Get featured posts
  async getFeaturedPosts(limit: number = 3) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get post by slug
  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    if (error) throw error;
    
    // Increment views
    if (data) {
      await supabase
        .from('blog_posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id);
    }
    
    return data;
  },

  // Search posts
  async searchPosts(query: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .or(`title_en.ilike.%${query}%,title_vi.ilike.%${query}%,excerpt_en.ilike.%${query}%,excerpt_vi.ilike.%${query}%`)
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get posts by category
  async getPostsByCategory(category: string, language: 'en' | 'vi') {
    const column = language === 'en' ? 'category_en' : 'category_vi';
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .eq(column, category)
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all posts (admin)
  async getAllPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create post
  async createPost(post: BlogPostInsert) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update post
  async updatePost(id: string, updates: BlogPostUpdate) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete post
  async deletePost(id: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle published
  async togglePublished(id: string, published: boolean) {
    return this.updatePost(id, { 
      published, 
      published_at: published ? new Date().toISOString() : null 
    });
  },

  // === Blog Tags ===
  
  // Get all tags
  async getAllTags() {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name_en');
    
    if (error) throw error;
    return data;
  },

  // Create tag
  async createTag(tag: BlogTagInsert) {
    const { data, error } = await supabase
      .from('blog_tags')
      .insert(tag)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete tag
  async deleteTag(id: string) {
    const { error } = await supabase
      .from('blog_tags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get posts by tag
  async getPostsByTag(tagId: string) {
    const { data, error } = await supabase
      .from('blog_post_tags')
      .select('post_id, blog_posts(*)')
      .eq('tag_id', tagId);
    
    if (error) throw error;
    return data.map(item => item.blog_posts).filter(Boolean);
  },

  // Link post to tags
  async linkPostToTags(postId: string, tagIds: string[]) {
    const links = tagIds.map(tagId => ({ post_id: postId, tag_id: tagId }));
    
    const { error } = await supabase
      .from('blog_post_tags')
      .insert(links);
    
    if (error) throw error;
  },

  // Unlink post from tag
  async unlinkPostFromTag(postId: string, tagId: string) {
    const { error } = await supabase
      .from('blog_post_tags')
      .delete()
      .eq('post_id', postId)
      .eq('tag_id', tagId);
    
    if (error) throw error;
  },
};
