import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, KeyRound, CheckCircle2, Eye, EyeOff, ShieldCheck, Loader2, AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const HOME_URL = '/';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        clearTimeout(timeoutId);
      }
    });

    // Fallback: check session after 3s
    timeoutId = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        setSessionError(true);
      }
    }, 3000);

    // Immediate check for existing session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  const strengthColors = [
    'bg-destructive',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-600',
  ];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Double-check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Phiên đăng nhập không hợp lệ. Vui lòng yêu cầu link đổi mật khẩu mới.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast.success('Mật khẩu đã được cập nhật thành công!');
      setTimeout(() => navigate('/admin'), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!sessionReady && !sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--navy-dark))] via-[hsl(var(--navy-main))] to-[hsl(var(--navy-light))] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 text-center space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--gold-main))] mx-auto" />
            <div className="space-y-2">
              <h1 className="font-display text-xl font-bold text-foreground">Đang xác thực...</h1>
              <p className="text-muted-foreground text-sm">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / expired state
  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--navy-dark))] via-[hsl(var(--navy-main))] to-[hsl(var(--navy-light))] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-xl font-bold text-foreground">Link đã hết hạn</h1>
              <p className="text-muted-foreground text-sm">
                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.
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
                <a href={HOME_URL}><Home className="w-4 h-4 mr-1" /> Về trang chủ</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--navy-dark))] via-[hsl(var(--navy-main))] to-[hsl(var(--navy-light))] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[hsl(var(--gold-main)/0.08)] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[hsl(var(--gold-main)/0.05)] blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 space-y-8">
          {success ? (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-2xl font-bold text-foreground">Đổi mật khẩu thành công!</h1>
                <p className="text-muted-foreground text-sm">Bạn sẽ được chuyển hướng đến trang đăng nhập...</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => navigate('/admin')}
                  className="rounded-xl bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-main))] text-[hsl(var(--navy-dark))] font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Đăng nhập ngay
                </Button>
                <Button asChild variant="outline" className="rounded-xl">
                  <a href={HOME_URL}><Home className="w-4 h-4 mr-1" /> Về trang chủ</a>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-light))] flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-[hsl(var(--navy-dark))]" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Đặt lại mật khẩu</h1>
                <p className="text-muted-foreground text-sm">Nhập mật khẩu mới cho tài khoản của bạn</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-10 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength] : 'bg-border'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Độ mạnh: <span className="font-medium">{strengthLabels[strength]}</span></p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 pr-10 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">Mật khẩu không khớp</p>
                  )}
                  {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Mật khẩu khớp
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-main))] text-[hsl(var(--navy-dark))] hover:opacity-90 transition-all shadow-lg"
                  disabled={loading || password !== confirmPassword || password.length < 6}
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </Button>
              </form>

              <div className="flex items-center justify-center gap-4 text-sm">
                <a href="/admin" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Đăng nhập
                </a>
                <span className="text-border">•</span>
                <a href={HOME_URL} className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
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
