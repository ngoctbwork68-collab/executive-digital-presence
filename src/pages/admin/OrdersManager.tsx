import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShoppingBag, Eye, Phone, MapPin, Calendar, MessageSquare, CreditCard } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
  completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chưa thanh toán', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  paid: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
};

const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export default function OrdersManager() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [payFilter, setPayFilter] = useState<string>('all');
  const [selected, setSelected] = useState<any>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = orders.filter((o: any) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (payFilter !== 'all' && (o.payment_status || 'pending') !== payFilter) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Cập nhật trạng thái');
    qc.invalidateQueries({ queryKey: ['admin_orders'] });
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const updatePayment = async (id: string, payment_status: string) => {
    const { error } = await supabase.from('orders').update({ payment_status } as any).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Cập nhật thanh toán');
    qc.invalidateQueries({ queryKey: ['admin_orders'] });
    if (selected?.id === id) setSelected({ ...selected, payment_status });
  };

  const counts = orders.reduce((acc: Record<string, number>, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const payCounts = orders.reduce((acc: Record<string, number>, o: any) => {
    const k = o.payment_status || 'pending';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Đơn hàng</h1>
        <p className="text-sm text-muted-foreground">Quản lý đơn hàng từ cửa hàng</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Trạng thái đơn</p>
          <div className="flex flex-wrap gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
              Tất cả ({orders.length})
            </Button>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key)}>
                {cfg.label} ({counts[key] || 0})
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><CreditCard className="w-3 h-3" />Thanh toán</p>
          <div className="flex flex-wrap gap-2">
            <Button variant={payFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setPayFilter('all')}>
              Tất cả
            </Button>
            {Object.entries(paymentConfig).map(([key, cfg]) => (
              <Button key={key} variant={payFilter === key ? 'default' : 'outline'} size="sm" onClick={() => setPayFilter(key)}>
                {cfg.label} ({payCounts[key] || 0})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
      ) : !filtered.length ? (
        <div className="text-center py-16 border border-dashed rounded-2xl">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Chưa có đơn hàng</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o: any) => (
            <Card key={o.id} className="hover:shadow-md transition">
              <CardContent className="p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold">{o.customer_name}</p>
                    <Badge className={statusConfig[o.status]?.color || ''}>{statusConfig[o.status]?.label || o.status}</Badge>
                    <Badge variant="outline" className={paymentConfig[o.payment_status || 'pending']?.color || ''}>
                      {paymentConfig[o.payment_status || 'pending']?.label || o.payment_status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.customer_phone}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(o.created_at).toLocaleString('vi-VN')}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{fmtVND(Number(o.total_amount))}</p>
                  <p className="text-xs text-muted-foreground">{o.order_items?.length || 0} sản phẩm</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelected(o)}>
                  <Eye className="w-4 h-4 mr-1.5" />Chi tiết
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">Đơn #{selected.id.slice(0, 8)}
                  <Badge className={statusConfig[selected.status]?.color}>{statusConfig[selected.status]?.label}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Khách hàng</p>
                    <p className="font-medium">{selected.customer_name}</p>
                    <p className="text-xs flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{selected.customer_phone}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />Địa chỉ</p>
                    <p className="font-medium">{selected.customer_address}</p>
                    {selected.delivery_time && <p className="text-xs mt-1">Giao: {selected.delivery_time}</p>}
                  </div>
                </div>

                {selected.customer_message && (
                  <div className="p-3 rounded-lg border bg-card text-sm">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Lời nhắn</p>
                    <p className="italic">"{selected.customer_message}"</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold mb-2">Sản phẩm</p>
                  <div className="space-y-2">
                    {selected.order_items?.map((it: any) => (
                      <div key={it.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{it.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {[it.selected_size, it.selected_color].filter(Boolean).join(' · ')} × {it.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">{fmtVND(Number(it.product_price) * it.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary">{fmtVND(Number(selected.total_amount))}</span>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Đổi trạng thái</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <Button key={key} size="sm" variant={selected.status === key ? 'default' : 'outline'} onClick={() => updateStatus(selected.id, key)}>
                        {cfg.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><CreditCard className="w-4 h-4" />Trạng thái thanh toán</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(paymentConfig).map(([key, cfg]) => (
                      <Button key={key} size="sm" variant={(selected.payment_status || 'pending') === key ? 'default' : 'outline'} onClick={() => updatePayment(selected.id, key)}>
                        {cfg.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
