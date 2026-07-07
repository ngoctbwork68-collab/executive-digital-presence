import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Mail, Phone, MapPin, Save, Inbox, Eye, EyeOff, Trash2,
  Clock, User, MessageSquare, Search, CheckCircle2, Circle,
  ChevronRight, Globe, ExternalLink, X, Settings2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  seen: boolean | null;
  created_at: string | null;
}

export default function ContactManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [saving, setSaving] = useState(false);

  // Load contact info
  const { data: contact, refetch: refetchContact } = useQuery({
    queryKey: ['admin-contact-info'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    location: '',
    map_embed_url: '',
  });

  // Sync contact data to form
  const isContactLoaded = !!contact;
  useState(() => {
    if (contact) {
      setContactForm({
        email: contact.email || '',
        phone: contact.phone || '',
        location: contact.location || '',
        map_embed_url: contact.map_embed_url || '',
      });
    }
  });

  // Load submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContactSubmission[];
    },
  });

  const filteredSubmissions = (submissions || []).filter(s => {
    if (filter === 'unread' && s.seen) return false;
    if (filter === 'read' && !s.seen) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.message.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = submissions?.filter(s => !s.seen).length || 0;

  const handleSaveContact = async () => {
    setSaving(true);
    try {
      if (contact?.id) {
        const { error } = await supabase.from('contacts').update(contactForm).eq('id', contact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('contacts').insert(contactForm);
        if (error) throw error;
      }
      await refetchContact();
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Đã lưu thông tin liên hệ');
    } catch (err: any) {
      toast.error(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const markAsSeen = async (id: string, seen: boolean) => {
    const { error } = await supabase.from('contact_submissions').update({ seen }).eq('id', id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, seen } : null);
      }
    }
  };

  const deleteSubmission = async (id: string) => {
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
      toast.success('Đã xóa');
    }
  };

  const openSubmission = async (sub: ContactSubmission) => {
    setSelectedSubmission(sub);
    if (!sub.seen) {
      await markAsSeen(sub.id, true);
    }
  };

  // Update contactForm when contact data loads
  if (contact && contactForm.email === '' && contact.email) {
    setContactForm({
      email: contact.email || '',
      phone: contact.phone || '',
      location: contact.location || '',
      map_embed_url: contact.map_embed_url || '',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý Liên hệ</h1>
        <p className="text-sm text-muted-foreground">Cấu hình thông tin liên hệ và quản lý tin nhắn từ khách</p>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="submissions" className="gap-2">
            <Inbox size={14} />
            Tin nhắn
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] rounded-full">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings2 size={14} />
            Thông tin liên hệ
          </TabsTrigger>
        </TabsList>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc nội dung..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="text-xs"
                >
                  {f === 'all' ? 'Tất cả' : f === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-full text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-card rounded-xl border border-border p-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <Inbox size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">
                {search ? 'Không tìm thấy kết quả' : 'Chưa có tin nhắn nào'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? 'Thử từ khóa khác' : 'Tin nhắn từ form liên hệ sẽ hiển thị ở đây'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubmissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => openSubmission(sub)}
                  className={cn(
                    "w-full text-left bg-card rounded-xl border transition-all duration-200 p-4 md:p-5 group hover:shadow-md hover:-translate-y-0.5",
                    !sub.seen
                      ? "border-primary/30 bg-primary/[0.02]"
                      : "border-border hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                      !sub.seen
                        ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {sub.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("font-semibold text-sm truncate", !sub.seen && "text-primary")}>
                          {sub.name}
                        </span>
                        {!sub.seen && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5 truncate">
                        {sub.email}
                        {sub.phone && <span className="ml-2">· {sub.phone}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {sub.message}
                      </p>
                    </div>

                    {/* Time & Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {sub.created_at && format(new Date(sub.created_at), 'dd/MM/yy HH:mm', { locale: vi })}
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Summary */}
          {submissions && submissions.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-xl px-4 py-3">
              <span>Tổng: {submissions.length} tin nhắn · {unreadCount} chưa đọc</span>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Thông tin liên hệ công khai</h3>
                  <p className="text-xs text-muted-foreground">Hiển thị trên trang Liên hệ cho khách truy cập</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-muted-foreground" /> Email liên hệ *
                  </Label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-muted-foreground" /> Số điện thoại
                  </Label>
                  <Input
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+84 xxx xxx xxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-muted-foreground" /> Địa điểm
                  </Label>
                  <Input
                    value={contactForm.location}
                    onChange={(e) => setContactForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="TP. Hồ Chí Minh, Việt Nam"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <ExternalLink size={14} className="text-muted-foreground" /> Google Maps Embed URL
                  </Label>
                  <Input
                    value={contactForm.map_embed_url}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Auto-extract src if user pastes full <iframe ...> HTML
                      const decoded = val.replace(/&quot;/g, '"').replace(/&#34;/g, '"').replace(/&amp;/g, '&');
                      const m = decoded.match(/src\s*=\s*["']([^"']+)["']/i);
                      const clean = m ? m[1] : val;
                      setContactForm(prev => ({ ...prev, map_embed_url: clean }));
                    }}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Dán URL bắt đầu bằng <code>https://www.google.com/maps/embed?pb=...</code>. Nếu dán cả thẻ <code>&lt;iframe&gt;</code>, hệ thống sẽ tự trích xuất URL.
                  </p>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveContact} disabled={saving || !contactForm.email}>
                  <Save size={14} className="mr-2" />
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 border border-border rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong>Ghi chú:</strong> Form liên hệ trên trang công khai bao gồm các trường: Họ tên (bắt buộc), Email (bắt buộc), Số điện thoại (tùy chọn), và Tin nhắn (bắt buộc). Khách truy cập có thể gửi tin nhắn mà không cần đăng nhập.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {selectedSubmission.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{selectedSubmission.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {selectedSubmission.created_at && format(new Date(selectedSubmission.created_at), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Contact info */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="inline-flex items-center gap-2 text-sm bg-muted hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Mail size={13} />
                    {selectedSubmission.email}
                  </a>
                  {selectedSubmission.phone && (
                    <a
                      href={`tel:${selectedSubmission.phone}`}
                      className="inline-flex items-center gap-2 text-sm bg-muted hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Phone size={13} />
                      {selectedSubmission.phone}
                    </a>
                  )}
                </div>

                {/* Message */}
                <div className="bg-muted/40 rounded-xl p-4 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Nội dung tin nhắn
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsSeen(selectedSubmission.id, !selectedSubmission.seen)}
                    >
                      {selectedSubmission.seen ? (
                        <><Circle size={13} className="mr-1.5" /> Đánh dấu chưa đọc</>
                      ) : (
                        <><CheckCircle2 size={13} className="mr-1.5" /> Đánh dấu đã đọc</>
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Xóa tin nhắn này?')) deleteSubmission(selectedSubmission.id);
                    }}
                  >
                    <Trash2 size={13} className="mr-1.5" /> Xóa
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
