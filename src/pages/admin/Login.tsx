import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Mail, ArrowLeft, KeyRound, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const check = async (userId?: string) => {
      if (!userId) return;
      const { data: hasAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      if (mounted && hasAdmin) navigate('/admin/dashboard');
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => check(session?.user?.id), 0);
    });
    supabase.auth.getSession().then(({ data: { session } }) => check(session?.user?.id));
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [navigate]);

  const friendlyError = (msg: string) => {
    if (/invalid login credentials/i.test(msg)) return 'Email hoặc mật khẩu không đúng';
    if (/email not confirmed/i.test(msg)) return 'Email chưa được xác nhận';
    if (/rate limit/i.test(msg)) return 'Quá nhiều lần thử, vui lòng đợi vài phút';
    return msg;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: hasAdmin, error: roleError } = await supabase.rpc('has_role', {
          _user_id: authData.user.id,
          _role: 'admin'
        });

        if (roleError) throw roleError;

        if (!hasAdmin) {
          await supabase.auth.signOut();
          toast.error('Unauthorized: You do not have admin access');
          return;
        }

        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(friendlyError(error?.message || 'Đăng nhập thất bại'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setForgotSent(true);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi email đặt lại mật khẩu');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--navy-dark))] via-[hsl(var(--navy-main))] to-[hsl(var(--navy-light))] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[hsl(var(--gold-main)/0.08)] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[hsl(var(--gold-main)/0.05)] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--gold-main)/0.03)] blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Logo / Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-light))] flex items-center justify-center shadow-lg">
              <KeyRound className="w-8 h-8 text-[hsl(var(--navy-dark))]" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              Admin Portal
            </h1>
            <p className="text-muted-foreground text-sm">
              Đăng nhập để quản lý nội dung
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[hsl(var(--gold-dark))] hover:text-[hsl(var(--gold-main))] transition-colors font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-main))] text-[hsl(var(--navy-dark))] hover:opacity-90 transition-all shadow-lg"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-4 text-sm">
            <a href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang chủ
            </a>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-light))] flex items-center justify-center">
              <Send className="w-6 h-6 text-[hsl(var(--navy-dark))]" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {forgotSent ? 'Email đã được gửi!' : 'Quên mật khẩu'}
            </DialogTitle>
            <DialogDescription>
              {forgotSent
                ? 'Kiểm tra hộp thư của bạn và nhấp vào liên kết để đặt lại mật khẩu.'
                : 'Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.'}
            </DialogDescription>
          </DialogHeader>

          {forgotSent ? (
            <div className="text-center py-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nếu không thấy email, hãy kiểm tra thư mục spam.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() => setForgotOpen(false)}
              >
                Đóng
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="email@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={forgotLoading}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-main))] text-[hsl(var(--navy-dark))]"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
