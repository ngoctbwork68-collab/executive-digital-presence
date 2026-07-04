import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  full_description: string | null;
  price: number;
  discount_percent: number | null;
  stock_quantity: number;
  image_url: string | null;
  images: string[] | null;
  colors: string[] | null;
  sizes: string[] | null;
  brand: string | null;
  category_id: string | null;
  product_type: string;
  featured: boolean | null;
  published: boolean | null;
  sort_order: number | null;
  external_url?: string | null;
  preview_url?: string | null;
  instructor?: string | null;
  duration?: string | null;
  level?: string | null;
  lessons_count?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
}

export const storeAPI = {
  async getPublishedProducts(type?: string) {
    let q = supabase.from('products').select('*').eq('published', true).order('sort_order');
    if (type) q = q.eq('product_type', type);
    const { data, error } = await q;
    if (error) throw error;
    return data as Product[];
  },

  async getAllProducts() {
    const { data, error } = await supabase.from('products').select('*').order('sort_order');
    if (error) throw error;
    return data as Product[];
  },

  async getProductBySlug(slug: string) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).eq('published', true).single();
    if (error) throw error;
    return data as Product;
  },

  async createProduct(p: Partial<Product>) {
    const { data, error } = await supabase.from('products').insert(p as any).select().single();
    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, p: Partial<Product>) {
    const { data, error } = await supabase.from('products').update(p as any).eq('id', id).select().single();
    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async getCategories() {
    const { data, error } = await supabase.from('product_categories').select('*').order('sort_order');
    if (error) throw error;
    return data as ProductCategory[];
  },

  async createCategory(c: Partial<ProductCategory>) {
    const { data, error } = await supabase.from('product_categories').insert(c as any).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) throw error;
  },
};
