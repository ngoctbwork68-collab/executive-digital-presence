import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const APPEARANCE_KEYS = ['chatbot_avatar_url', 'chatbot_name_vi', 'chatbot_name_en', 'chatbot_greeting_vi', 'chatbot_greeting_en'];

async function streamChat({
  messages,
  language,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  language: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, language }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'Lỗi kết nối AI');
    return;
  }

  if (!resp.body) { onError('No stream'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }
  onDone();
}

const SUGGESTED_QUESTIONS = {
  vi: [
    '👤 Giới thiệu về bạn?',
    '💼 Kinh nghiệm làm việc?',
    '🚀 Dự án nổi bật?',
    '🎓 Học vấn của bạn?',
    '📬 Cách liên hệ?',
    '⭐ Kỹ năng chính?',
  ],
  en: [
    '👤 Tell me about yourself?',
    '💼 Work experience?',
    '🚀 Notable projects?',
    '🎓 Education background?',
    '📬 How to contact?',
    '⭐ Key skills?',
  ],
};

const ChatbotWidget = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: appearance } = useQuery({
    queryKey: ['chatbot_appearance_public'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('key, value').in('key', APPEARANCE_KEYS);
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  const botAvatar = appearance?.chatbot_avatar_url || '';
  const botName = language === 'en'
    ? (appearance?.chatbot_name_en || 'AI Assistant')
    : (appearance?.chatbot_name_vi || 'Trợ lý AI');

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Detect if scrolled up
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [open]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    const userMsg: Message = { role: 'user', content: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    let assistantSoFar = '';

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: updatedMessages,
        language,
        onDelta: upsertAssistant,
        onDone: () => setLoading(false),
        onError: (err) => {
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err}` }]);
          setLoading(false);
        },
      });
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Không thể kết nối AI. Vui lòng thử lại.' }]);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', content: getGreeting() }]);
  };

  const getGreeting = () => {
    const custom = language === 'en' ? appearance?.chatbot_greeting_en : appearance?.chatbot_greeting_vi;
    if (custom?.trim()) return custom;
    return language === 'en'
      ? "👋 Hi! I'm the AI portfolio assistant. I know all about the portfolio owner's skills, experience, projects, and education. Ask me anything!"
      : "👋 Xin chào! Tôi là trợ lý AI portfolio. Tôi biết rõ về kỹ năng, kinh nghiệm, dự án và học vấn của chủ portfolio. Hỏi tôi bất cứ điều gì!";
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* FAB with pulse animation */}
      <button
        onClick={() => {
          setOpen(true);
          if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: getGreeting() }]);
          }
        }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-gold flex items-center justify-center hover:scale-110 transition-all duration-300 group ${open ? 'scale-0 pointer-events-none' : 'scale-100'}`}
        aria-label="Open chat"
      >
        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-secondary/30 animate-ping pointer-events-none" />
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center relative overflow-hidden">
                {botAvatar ? (
                  <img src={botAvatar} alt={botName} className="w-full h-full object-cover" />
                ) : (
                  <Sparkles size={16} className="text-secondary" />
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <span className="font-semibold text-sm block leading-tight">{botName}</span>
                <span className="text-[10px] opacity-60">
                  {loading ? (language === 'en' ? 'Typing...' : 'Đang trả lời...') : 'Online'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="hover:opacity-70 transition-opacity p-1 rounded-md hover:bg-primary-foreground/10"
                title={language === 'en' ? 'New conversation' : 'Cuộc trò chuyện mới'}
              >
                <RotateCcw size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity p-1 rounded-md hover:bg-primary-foreground/10">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 relative">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s`, animationFillMode: 'both' }}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                    {botAvatar ? <img src={botAvatar} alt="" className="w-full h-full object-cover" /> : <Bot size={14} className="text-secondary" />}
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-1 prose-ul:my-1 prose-li:my-0.5 prose-a:text-primary [&_p]:leading-relaxed [&_ul]:pl-4 [&_ol]:pl-4">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-primary" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-2 items-start animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Bot size={14} className="text-secondary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {showSuggestions && !loading && (
              <div className="pt-2 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  {language === 'en' ? '💡 Suggested questions:' : '💡 Câu hỏi gợi ý:'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS[language].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 border border-secondary/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
            >
              <ChevronDown size={16} />
            </button>
          )}

          {/* Input */}
          <div className="border-t border-border p-3 shrink-0 bg-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en' ? 'Ask me anything...' : 'Hỏi tôi bất cứ điều gì...'}
                className="flex-1 text-sm rounded-full"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={loading || !input.trim()}>
                <Send size={16} />
              </Button>
            </form>
            <p className="text-[9px] text-muted-foreground text-center mt-1.5 opacity-50">
              AI Assistant
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
