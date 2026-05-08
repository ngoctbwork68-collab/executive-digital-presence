import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Bot, MessageCircleQuestion, Image as ImageIcon, Save, X } from 'lucide-react';

const empty = { question: '', answer: '', keywords: '', language: 'vi', priority: 0, active: true };

export default function ChatbotManager() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['chatbot_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('chatbot_training').select('*').order('priority', { ascending: false });
      return data || [];
    },
  });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const openCreate = () => { setEditId(null); setForm(empty); setOpen(true); };
  const openEdit = (q: any) => {
    setEditId(q.id);
    setForm({
      question: q.question, answer: q.answer,
      keywords: (q.keywords || []).join(', '),
      language: q.language, priority: q.priority || 0, active: q.active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) return toast.error('Câu hỏi và trả lời là bắt buộc');
    const payload = {
      question: form.question,
      answer: form.answer,
      keywords: form.keywords.split(',').map(s => s.trim()).filter(Boolean),
      language: form.language,
      priority: Number(form.priority) || 0,
      active: form.active,
    };
    const { error } = editId
      ? await supabase.from('chatbot_training').update(payload).eq('id', editId)
      : await supabase.from('chatbot_training').insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editId ? 'Đã cập nhật' : 'Đã thêm');
    setOpen(false);
    qc.invalidateQueries({ queryKey: ['chatbot_admin'] });
  };

  const del = async (id: string) => {
    if (!confirm('Xóa Q&A này?')) return;
    await supabase.from('chatbot_training').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['chatbot_admin'] });
    toast.success('Đã xóa');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đào tạo Chatbot</h1>
          <p className="text-sm text-muted-foreground">Q&A tùy chỉnh để chatbot trả lời chính xác hơn</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Thêm Q&A</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
      ) : !data.length ? (
        <div className="text-center py-16 border border-dashed rounded-2xl">
          <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Chưa có Q&A nào</p>
          <Button variant="outline" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Thêm Q&A đầu tiên</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((q: any) => (
            <Card key={q.id} className={!q.active ? 'opacity-60' : ''}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <MessageCircleQuestion className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold">{q.question}</p>
                      <Badge variant="outline" className="text-xs">{q.language?.toUpperCase()}</Badge>
                      {q.priority > 0 && <Badge variant="secondary" className="text-xs">P{q.priority}</Badge>}
                      {!q.active && <Badge variant="outline" className="text-xs">Tắt</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{q.answer}</p>
                    {q.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.keywords.map((k: string, i: number) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Sửa Q&A' : 'Thêm Q&A'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Câu hỏi *</Label>
              <Input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="VD: Bạn có nhận tư vấn không?" />
            </div>
            <div>
              <Label>Câu trả lời *</Label>
              <Textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={5} placeholder="Câu trả lời chi tiết..." />
            </div>
            <div>
              <Label>Từ khóa (cách nhau bằng dấu phẩy)</Label>
              <Input value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} placeholder="tư vấn, dịch vụ, giá" />
              <p className="text-xs text-muted-foreground mt-1">Bot sẽ ưu tiên trả lời khi câu hỏi của user chứa các từ này</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ngôn ngữ</Label>
                <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <Label>Độ ưu tiên</Label>
                <Input type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Kích hoạt</Label>
              <Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Hủy</Button>
              <Button className="flex-1" onClick={save}>{editId ? 'Cập nhật' : 'Thêm'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
