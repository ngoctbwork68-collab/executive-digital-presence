import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send, CheckCircle2, Home, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Đã gửi link đặt lại mật khẩu!');
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi email đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--navy-dark))] via-[hsl(var(--navy-main))] to-[hsl(var(--navy-light))] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[hsl(var(--gold-main)/0.08)] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[hsl(var(--gold-main)/0.05)] blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 space-y-7">
          {sent ? (
            <div className="text-center space-y-6 py-2">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-2xl font-bold text-foreground">Đã gửi email!</h1>
                <p className="text-muted-foreground text-sm">
                  Chúng tôi đã gửi link đặt lại mật khẩu tới <span className="font-medium text-foreground">{email}</span>.
                  Vui lòng kiểm tra hộp thư (cả mục Spam) và nhấp vào liên kết để tiếp tục.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => navigate('/admin')}
                  className="rounded-xl bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-main))] text-[hsl(var(--navy-dark))] font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại đăng nhập
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <a href="/"><Home className="w-4 h-4 mr-1" /> Về trang chủ</a>
                </Button>
              </div>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Gửi lại với email khác
              </button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-light))] flex items-center justify-center shadow-lg">
                  <KeyRound className="w-8 h-8 text-[hsl(var(--navy-dark))]" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Quên mật khẩu</h1>
                <p className="text-muted-foreground text-sm">
                  Nhập email tài khoản của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-main))] text-[hsl(var(--navy-dark))] hover:opacity-90 transition-all shadow-lg"
                  disabled={loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
                </Button>
              </form>

              <div className="flex items-center justify-center gap-4 text-sm">
                <a href="/admin" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Đăng nhập
                </a>
                <span className="text-border">•</span>
                <a href="/" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> Trang chủ
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
