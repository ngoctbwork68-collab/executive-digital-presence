import { supabase } from '@/integrations/supabase/client';

export interface Voucher {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number | null;
  valid_from: string | null;
  valid_until: string | null;
  product_types: string[] | null;
  active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function validateVoucher(
  voucher: Voucher,
  orderAmount: number,
  productType?: string
): { valid: boolean; error?: string } {
  if (!voucher.active) return { valid: false, error: 'Mã không còn hiệu lực' };
  if (voucher.valid_from && new Date() < new Date(voucher.valid_from))
    return { valid: false, error: 'Mã chưa có hiệu lực' };
  if (voucher.valid_until && new Date() > new Date(voucher.valid_until))
    return { valid: false, error: 'Mã đã hết hạn' };
  if (voucher.usage_limit && (voucher.used_count ?? 0) >= voucher.usage_limit)
    return { valid: false, error: 'Mã đã hết lượt sử dụng' };
  if (voucher.min_order_amount && orderAmount < voucher.min_order_amount)
    return {
      valid: false,
      error: `Đơn tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.min_order_amount)}`,
    };
  if (
    voucher.product_types &&
    voucher.product_types.length > 0 &&
    productType &&
    !voucher.product_types.includes(productType)
  )
    return { valid: false, error: 'Mã không áp dụng cho sản phẩm này' };
  return { valid: true };
}

export function calculateDiscount(voucher: Voucher, amount: number): number {
  if (voucher.discount_type === 'percent') {
    const discount = amount * (voucher.discount_value / 100);
    return voucher.max_discount ? Math.min(discount, voucher.max_discount) : discount;
  }
  return Math.min(voucher.discount_value, amount);
}

export const vouchersAPI = {
  async getAll() {
    const { data, error } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Voucher[];
  },

  async getByCode(code: string) {
    const { data, error } = await supabase.rpc('validate_voucher_by_code', { _code: code });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('Voucher not found');
    return row as Voucher;
  },

  async create(v: Partial<Voucher>) {
    const { data, error } = await supabase.from('vouchers').insert(v as any).select().single();
    if (error) throw error;
    return data as Voucher;
  },

  async update(id: string, v: Partial<Voucher>) {
    const { data, error } = await supabase.from('vouchers').update(v as any).eq('id', id).select().single();
    if (error) throw error;
    return data as Voucher;
  },

  async delete(id: string) {
    const { error } = await supabase.from('vouchers').delete().eq('id', id);
    if (error) throw error;
  },

  async incrementUsedCount(id: string) {
    const { data: voucher } = await supabase.from('vouchers').select('used_count').eq('id', id).single();
    if (voucher) {
      await supabase
        .from('vouchers')
        .update({ used_count: (voucher.used_count ?? 0) + 1 } as any)
        .eq('id', id);
    }
  },
};
