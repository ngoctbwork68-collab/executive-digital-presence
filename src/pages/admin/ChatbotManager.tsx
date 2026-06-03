import { useState, useMemo, useRef } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  Plus, Pencil, Trash2, Bot, MessageCircleQuestion, Image as ImageIcon, Save, X,
  Search, Download, Upload, Copy, PlayCircle, Sparkles, BarChart3, Filter, Loader2, Send
} from 'lucide-react';

const empty = { question: '', answer: '', keywords: '', language: 'vi', priority: 0, active: true };
const APPEARANCE_KEYS = ['chatbot_avatar_url', 'chatbot_name_vi', 'chatbot_name_en', 'chatbot_greeting_vi', 'chatbot_greeting_en'] as const;
type AppearanceKey = typeof APPEARANCE_KEYS[number];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export default function ChatbotManager() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['chatbot_admin'],
    queryFn: async () => {
      const { data } = await supabase.from('chatbot_training').select('*').order('priority', { ascending: false });
      return data || [];
    },
  });

  const { data: appearance } = useQuery({
    queryKey: ['chatbot_appearance'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('key, value').in('key', APPEARANCE_KEYS as any);
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const [appForm, setAppForm] = useState<Record<AppearanceKey, string>>({
    chatbot_avatar_url: '', chatbot_name_vi: '', chatbot_name_en: '',
    chatbot_greeting_vi: '', chatbot_greeting_en: '',
  });
  const [appLoaded, setAppLoaded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingApp, setSavingApp] = useState(false);

  if (appearance && !appLoaded) {
    setAppForm({
      chatbot_avatar_url: appearance.chatbot_avatar_url || '',
      chatbot_name_vi: appearance.chatbot_name_vi || 'Trợ lý AI',
      chatbot_name_en: appearance.chatbot_name_en || 'AI Assistant',
      chatbot_greeting_vi: appearance.chatbot_greeting_vi || '',
      chatbot_greeting_en: appearance.chatbot_greeting_en || '',
    });
    setAppLoaded(true);
  }

  const saveAppearance = async () => {
    setSavingApp(true);
    try {
      const rows = APPEARANCE_KEYS.map(k => ({ key: k, value: appForm[k] || '' }));
      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Đã lưu giao diện chatbot');
      qc.invalidateQueries({ queryKey: ['chatbot_appearance'] });
      qc.invalidateQueries({ queryKey: ['chatbot_appearance_public'] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingApp(false);
    }
  };

  // ============== Q&A CRUD ==============
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

  const duplicate = async (q: any) => {
    const { error } = await supabase.from('chatbot_training').insert({
      question: q.question + ' (copy)',
      answer: q.answer,
      keywords: q.keywords || [],
      language: q.language,
      priority: q.priority || 0,
      active: false,
    });
    if (error) return toast.error(error.message);
    toast.success('Đã nhân bản');
    qc.invalidateQueries({ queryKey: ['chatbot_admin'] });
  };

  const toggleActive = async (q: any) => {
    await supabase.from('chatbot_training').update({ active: !q.active }).eq('id', q.id);
    qc.invalidateQueries({ queryKey: ['chatbot_admin'] });
  };

  // ============== Search / Filter / Sort ==============
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'vi' | 'en'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'on' | 'off'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'recent' | 'az'>('priority');

  const filtered = useMemo(() => {
    let list = [...(data as any[])];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(q =>
        q.question.toLowerCase().includes(s) ||
        q.answer.toLowerCase().includes(s) ||
        (q.keywords || []).some((k: string) => k.toLowerCase().includes(s))
      );
    }
    if (langFilter !== 'all') list = list.filter(q => q.language === langFilter);
    if (activeFilter !== 'all') list = list.filter(q => q.active === (activeFilter === 'on'));
    if (sortBy === 'priority') list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    else if (sortBy === 'recent') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else list.sort((a, b) => a.question.localeCompare(b.question));
    return list;
  }, [data, search, langFilter, activeFilter, sortBy]);

  // ============== Stats ==============
  const stats = useMemo(() => {
    const list = data as any[];
    return {
      total: list.length,
      active: list.filter(q => q.active).length,
      vi: list.filter(q => q.language === 'vi').length,
      en: list.filter(q => q.language === 'en').length,
      withKw: list.filter(q => (q.keywords || []).length > 0).length,
    };
  }, [data]);

  // ============== Import / Export ==============
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `chatbot-training-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${data.length} Q&A`);
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error('Định dạng phải là mảng JSON');
      const rows = arr.map((q: any) => ({
        question: String(q.question || '').slice(0, 1000),
        answer: String(q.answer || '').slice(0, 5000),
        keywords: Array.isArray(q.keywords) ? q.keywords : [],
        language: q.language === 'en' ? 'en' : 'vi',
        priority: Number(q.priority) || 0,
        active: q.active !== false,
      })).filter(r => r.question && r.answer);
      if (!rows.length) throw new Error('Không có Q&A hợp lệ');
      const { error } = await supabase.from('chatbot_training').insert(rows);
      if (error) throw error;
      toast.success(`Đã nhập ${rows.length} Q&A`);
      qc.invalidateQueries({ queryKey: ['chatbot_admin'] });
    } catch (e: any) {
      toast.error('Lỗi nhập: ' + e.message);
    }
  };

  // ============== AI Keyword Suggester (local heuristic) ==============
  const suggestKeywords = () => {
    const text = (form.question + ' ' + form.answer).toLowerCase();
    const stop = new Set(['của','và','là','trong','cho','với','về','như','khi','tôi','bạn','một','các','những','thì','mà','để','có','được','này','đó','the','a','an','is','are','of','for','to','in','on','at','by','with','and','or','can','how','what','when','why']);
    const tokens = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
      .split(/[^a-z0-9]+/).filter(t => t.length >= 4 && !stop.has(t));
    const freq: Record<string, number> = {};
    tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
    const existing = form.keywords.split(',').map(s => s.trim()).filter(Boolean);
    const merged = [...new Set([...existing, ...top])];
    setForm(p => ({ ...p, keywords: merged.join(', ') }));
    toast.success('Đã gợi ý từ khóa');
  };

  // ============== Test Playground ==============
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testLang, setTestLang] = useState<'vi' | 'en'>('vi');
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    if (!testInput.trim() || testing) return;
    setTesting(true);
    setTestOutput('');
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testInput }],
          language: testLang,
        }),
      });
      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Lỗi gọi AI');
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const c = JSON.parse(json).choices?.[0]?.delta?.content;
            if (c) { acc += c; setTestOutput(acc); }
          } catch {}
        }
      }
    } catch (e: any) {
      setTestOutput('⚠️ ' + e.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bot className="w-6 h-6 text-primary" /> Đào tạo Chatbot</h1>
          <p className="text-sm text-muted-foreground">Quản lý giao diện, Q&A huấn luyện và kiểm thử trợ lý AI</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Thêm Q&A</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Tổng Q&A', value: stats.total, icon: BarChart3, color: 'text-primary' },
          { label: 'Đang bật', value: stats.active, icon: Sparkles, color: 'text-green-600' },
          { label: 'Tiếng Việt', value: stats.vi, icon: MessageCircleQuestion, color: 'text-blue-600' },
          { label: 'English', value: stats.en, icon: MessageCircleQuestion, color: 'text-purple-600' },
          { label: 'Có keyword', value: stats.withKw, icon: Filter, color: 'text-orange-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="training">
        <TabsList>
          <TabsTrigger value="training"><MessageCircleQuestion className="w-4 h-4 mr-1.5" /> Q&A</TabsTrigger>
          <TabsTrigger value="test"><PlayCircle className="w-4 h-4 mr-1.5" /> Kiểm thử</TabsTrigger>
          <TabsTrigger value="appearance"><Bot className="w-4 h-4 mr-1.5" /> Giao diện</TabsTrigger>
        </TabsList>

        {/* === TRAINING === */}
        <TabsContent value="training" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-3 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm câu hỏi, câu trả lời, keyword..." className="pl-9" />
              </div>
              <select value={langFilter} onChange={e => setLangFilter(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">Tất cả ngôn ngữ</option>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
              <select value={activeFilter} onChange={e => setActiveFilter(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">Tất cả trạng thái</option>
                <option value="on">Đang bật</option>
                <option value="off">Đang tắt</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="priority">Theo độ ưu tiên</option>
                <option value="recent">Mới nhất</option>
                <option value="az">A → Z</option>
              </select>
              <Button variant="outline" size="sm" onClick={exportJson}><Download className="w-4 h-4 mr-1.5" />Xuất JSON</Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-1.5" />Nhập JSON</Button>
              <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
          ) : !filtered.length ? (
            <div className="text-center py-16 border border-dashed rounded-2xl">
              <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{data.length ? 'Không có Q&A phù hợp bộ lọc' : 'Chưa có Q&A nào'}</p>
              <Button variant="outline" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Thêm Q&A đầu tiên</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((q: any) => (
                <Card key={q.id} className={!q.active ? 'opacity-60' : ''}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <MessageCircleQuestion className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold">{q.question}</p>
                          <Badge variant="outline" className="text-xs">{q.language?.toUpperCase()}</Badge>
                          {q.priority > 0 && <Badge variant="secondary" className="text-xs">P{q.priority}</Badge>}
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
                      <div className="flex items-center gap-1">
                        <Switch checked={q.active} onCheckedChange={() => toggleActive(q)} />
                        <Button variant="ghost" size="icon" onClick={() => { setTestInput(q.question); setTestLang(q.language); toast.info('Đã đặt vào tab Kiểm thử'); }} title="Test"><PlayCircle className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => duplicate(q)} title="Nhân bản"><Copy className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => del(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === TEST === */}
        <TabsContent value="test" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><PlayCircle className="w-5 h-5" /> Kiểm thử chatbot</CardTitle>
              <p className="text-xs text-muted-foreground">Gọi trực tiếp edge function chat — xem chatbot sẽ trả lời ra sao với dữ liệu DB hiện tại</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <select value={testLang} onChange={e => setTestLang(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="vi">VI</option>
                  <option value="en">EN</option>
                </select>
                <Input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="Nhập câu hỏi giả lập từ khách..." onKeyDown={e => e.key === 'Enter' && runTest()} />
                <Button onClick={runTest} disabled={testing || !testInput.trim()}>
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <div className="min-h-[200px] rounded-xl border border-border bg-muted/30 p-4">
                {testOutput ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-a:text-primary">
                    <ReactMarkdown>{testOutput}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {testing ? 'Chatbot đang suy nghĩ...' : 'Phản hồi sẽ hiển thị ở đây (có markdown + nguồn trích dẫn)'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === APPEARANCE === */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Bot className="w-5 h-5" /> Giao diện Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <Label className="mb-2 block">Ảnh đại diện</Label>
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                    {appForm.chatbot_avatar_url ? (
                      <img src={appForm.chatbot_avatar_url} alt="Chatbot avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Bot className="w-10 h-10 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                      <ImageIcon className="w-3.5 h-3.5 mr-1" /> Chọn
                    </Button>
                    {appForm.chatbot_avatar_url && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAppForm(p => ({ ...p, chatbot_avatar_url: '' }))}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Tên chatbot (VI)</Label>
                    <Input value={appForm.chatbot_name_vi} onChange={e => setAppForm(p => ({ ...p, chatbot_name_vi: e.target.value }))} placeholder="Trợ lý AI" />
                  </div>
                  <div>
                    <Label>Tên chatbot (EN)</Label>
                    <Input value={appForm.chatbot_name_en} onChange={e => setAppForm(p => ({ ...p, chatbot_name_en: e.target.value }))} placeholder="AI Assistant" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Lời chào (VI)</Label>
                    <Textarea rows={2} value={appForm.chatbot_greeting_vi} onChange={e => setAppForm(p => ({ ...p, chatbot_greeting_vi: e.target.value }))} placeholder="👋 Xin chào! Tôi có thể giúp gì cho bạn?" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Lời chào (EN)</Label>
                    <Textarea rows={2} value={appForm.chatbot_greeting_en} onChange={e => setAppForm(p => ({ ...p, chatbot_greeting_en: e.target.value }))} placeholder="👋 Hi! How can I help you?" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveAppearance} disabled={savingApp}>
                  <Save className="w-4 h-4 mr-2" /> {savingApp ? 'Đang lưu...' : 'Lưu giao diện'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => { setAppForm(p => ({ ...p, chatbot_avatar_url: url })); setPickerOpen(false); }}
        accept="image"
      />

      {/* Q&A Dialog */}
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
              <Label>Câu trả lời * <span className="text-xs text-muted-foreground">(hỗ trợ markdown)</span></Label>
              <Textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={6} placeholder="Câu trả lời chi tiết, có thể dùng **bold**, link [tên](/url)..." />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Từ khóa</Label>
                <Button type="button" variant="ghost" size="sm" onClick={suggestKeywords}>
                  <Sparkles className="w-3 h-3 mr-1" /> Gợi ý tự động
                </Button>
              </div>
              <Input value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} placeholder="tư vấn, dịch vụ, giá (phân cách bằng dấu phẩy)" />
              <p className="text-xs text-muted-foreground mt-1">Bot sẽ ưu tiên Q&A này khi câu hỏi user chứa các từ trên</p>
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
                <Label>Độ ưu tiên (0–100)</Label>
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
