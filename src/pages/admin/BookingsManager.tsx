import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  CalendarDays, Mail, Phone, Trash2, ExternalLink, AlertCircle,
  CheckCircle2, Clock, MessageSquare,
} from 'lucide-react';

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  topic: string | null;
  message: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  google_event_id: string | null;
  google_event_link: string | null;
  google_sync_error: string | null;
  admin_notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  completed: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
};

export default function BookingsManager() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('start_time', { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Booking> }) => {
      const { error } = await supabase.from('bookings').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Đã cập nhật');
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (e: any) => toast.error(e?.message || 'Lỗi cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Đã xóa');
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });

  const filtered = bookings?.filter((b) => filter === 'all' || b.status === filter) ?? [];

  const stats = {
    total: bookings?.length ?? 0,
    pending: bookings?.filter((b) => b.status === 'pending').length ?? 0,
    confirmed: bookings?.filter((b) => b.status === 'confirmed').length ?? 0,
    syncedGcal: bookings?.filter((b) => b.google_event_id).length ?? 0,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Đặt lịch hẹn</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các yêu cầu đặt lịch gửi từ trang Liên hệ. Tự động đồng bộ với Google Calendar.
          </p>
        </div>
        <a
          href="https://calendar.google.com/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" /> Mở Google Calendar
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tổng" value={stats.total} icon={CalendarDays} />
        <StatCard label="Chờ duyệt" value={stats.pending} icon={Clock} tone="amber" />
        <StatCard label="Đã xác nhận" value={stats.confirmed} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Đã sync GCal" value={stats.syncedGcal} icon={ExternalLink} tone="blue" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Lọc:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
            <SelectItem value="completed">Hoàn tất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          Chưa có lịch hẹn nào.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onStatusChange={(status) => updateMutation.mutate({ id: b.id, patch: { status } })}
              onSaveNotes={(admin_notes) => updateMutation.mutate({ id: b.id, patch: { admin_notes } })}
              onDelete={() => {
                if (confirm('Xóa lịch hẹn này?')) deleteMutation.mutate(b.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, tone,
}: { label: string; value: number; icon: any; tone?: string }) {
  const colors: Record<string, string> = {
    amber: 'text-amber-500 bg-amber-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tone ? colors[tone] : 'bg-muted'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({
  booking, onStatusChange, onSaveNotes, onDelete,
}: {
  booking: Booking;
  onStatusChange: (s: string) => void;
  onSaveNotes: (n: string) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(booking.admin_notes || '');
  const start = new Date(booking.start_time);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-lg">{booking.customer_name}</h3>
              <Badge variant="outline" className={STATUS_COLORS[booking.status] || ''}>
                {booking.status}
              </Badge>
              {booking.google_event_id && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> GCal
                </Badge>
              )}
              {booking.google_sync_error && !booking.google_event_id && (
                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 gap-1">
                  <AlertCircle className="w-3 h-3" /> Sync lỗi
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {format(start, "EEEE, d MMMM yyyy 'lúc' HH:mm", { locale: vi })}
              {' '}· {booking.duration_minutes}m
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={booking.status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="completed">Hoàn tất</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <a href={`mailto:${booking.customer_email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <Mail className="w-3.5 h-3.5" /> {booking.customer_email}
          </a>
          {booking.customer_phone && (
            <a href={`tel:${booking.customer_phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Phone className="w-3.5 h-3.5" /> {booking.customer_phone}
            </a>
          )}
        </div>

        {booking.topic && (
          <p className="text-sm mt-2"><span className="text-muted-foreground">Chủ đề:</span> {booking.topic}</p>
        )}
        {booking.message && (
          <p className="text-sm mt-2 p-3 bg-muted/50 rounded-lg whitespace-pre-wrap">{booking.message}</p>
        )}

        {booking.google_sync_error && (
          <p className="text-xs mt-2 text-rose-600">Sync error: {booking.google_sync_error}</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Ghi chú nội bộ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Ghi chú nội bộ</DialogTitle></DialogHeader>
              <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú riêng tư..." />
              <Button onClick={() => onSaveNotes(notes)}>Lưu</Button>
            </DialogContent>
          </Dialog>
          {booking.google_event_link && (
            <a href={booking.google_event_link} target="_blank" rel="noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1.5">
              Mở Google Calendar <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
