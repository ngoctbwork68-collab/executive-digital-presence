import { useState, useMemo } from 'react';
import { format, addDays, startOfDay, isBefore, isSameDay } from 'date-fns';
import { vi as viLocale, enUS } from 'date-fns/locale';
import { CalendarIcon, Clock, Send, CheckCircle2, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];
const DURATIONS = [15, 30, 45, 60];

export default function BookingForm() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = (en: string, vi: string) => (language === 'en' ? en : vi);

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState(30);
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<{ link: string | null } | null>(null);

  const minDate = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addDays(new Date(), 60), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !form.name || !form.email) {
      toast({
        title: t('Missing info', 'Thiếu thông tin'),
        description: t('Pick a date, time and fill name & email.', 'Chọn ngày, giờ và điền tên & email.'),
        variant: 'destructive',
      });
      return;
    }

    const [hh, mm] = time.split(':').map(Number);
    const start = new Date(date);
    start.setHours(hh, mm, 0, 0);

    if (isBefore(start, new Date())) {
      toast({
        title: t('Invalid time', 'Giờ không hợp lệ'),
        description: t('Pick a future time slot.', 'Vui lòng chọn khung giờ trong tương lai.'),
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone || null,
          topic: form.topic || null,
          message: form.message || null,
          start_time: start.toISOString(),
          duration_minutes: duration,
          timezone: 'Asia/Ho_Chi_Minh',
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed');

      setSuccess({ link: data.google_event_link ?? null });
      setForm({ name: '', email: '', phone: '', topic: '', message: '' });
      setDate(undefined); setTime('');
      toast({
        title: t('Booking received!', 'Đã nhận đặt lịch!'),
        description: t("I'll confirm shortly.", 'Tôi sẽ xác nhận sớm với bạn.'),
      });
    } catch (err: any) {
      toast({
        title: t('Error', 'Lỗi'),
        description: err?.message || t('Try again.', 'Vui lòng thử lại.'),
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="font-serif text-2xl font-bold mb-2">
            {t('Booking confirmed', 'Đặt lịch thành công')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t(
              "Thank you! A confirmation email will follow shortly.",
              'Cảm ơn bạn! Email xác nhận sẽ được gửi sớm.',
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {success.link && (
              <Button asChild variant="outline" className="rounded-lg">
                <a href={success.link} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('View on Google Calendar', 'Xem trên Google Calendar')}
                </a>
              </Button>
            )}
            <Button onClick={() => setSuccess(null)} className="rounded-lg">
              {t('Book another', 'Đặt lịch khác')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-8">
        <h2 className="font-serif text-2xl font-bold mb-1">
          {t('Book a meeting', 'Đặt lịch hẹn')}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t('Choose a date and time that works for you.', 'Chọn ngày và giờ phù hợp với bạn.')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date + Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t('Date', 'Ngày')} *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal rounded-lg',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date
                      ? format(date, 'PPP', { locale: language === 'en' ? enUS : viLocale })
                      : t('Pick a date', 'Chọn ngày')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => isBefore(d, minDate) || isBefore(maxDate, d)}
                    initialFocus
                    locale={language === 'en' ? enUS : viLocale}
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t('Duration', 'Thời lượng')}
              </label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                      duration === d
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time slots */}
          <div>
            <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {t('Time slot', 'Khung giờ')} *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TIME_SLOTS.map((slot) => {
                const disabled =
                  date && isSameDay(date, new Date()) &&
                  (() => {
                    const [h, m] = slot.split(':').map(Number);
                    const d = new Date(date); d.setHours(h, m, 0, 0);
                    return isBefore(d, new Date());
                  })();
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!!disabled}
                    onClick={() => setTime(slot)}
                    className={cn(
                      'py-2 rounded-lg text-sm font-medium border transition-all',
                      time === slot
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/40',
                      disabled && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('Full Name', 'Họ và tên')} *</label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email *</label>
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('Phone', 'Điện thoại')}</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('Topic', 'Chủ đề')}</label>
              <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder={t('e.g. Sales consulting', 'VD: Tư vấn sales')} className="rounded-lg" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('Notes', 'Ghi chú')}</label>
            <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-lg resize-none" />
          </div>

          <Button type="submit" size="lg" disabled={sending} className="w-full rounded-lg gold-shine">
            {sending ? (
              <span className="animate-pulse">{t('Booking...', 'Đang đặt...')}</span>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                {t('Confirm Booking', 'Xác nhận đặt lịch')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
