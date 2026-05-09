import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme';
import {
  User, Briefcase, FolderOpen, Activity, FileText,
  Image, Settings, LogOut, LayoutDashboard, GraduationCap,
  Sun, Moon, Menu, X, ChevronRight, Blocks, ShoppingBag, Ticket, Quote, MessageCircle, BookOpen,
  Sparkles, Package, Tags, Bot, LayoutGrid, CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuGroups = [
  {
    label: 'Tổng quan',
    items: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/guide', icon: BookOpen, label: 'Hướng dẫn' },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { path: '/admin/profile', icon: User, label: 'Hồ sơ' },
      { path: '/admin/branding', icon: Sparkles, label: 'Trang & Branding' },
      { path: '/admin/sections-order', icon: LayoutGrid, label: 'Sắp xếp Section' },
      { path: '/admin/experiences', icon: Briefcase, label: 'Kinh nghiệm' },
      { path: '/admin/education', icon: GraduationCap, label: 'Học vấn' },
      { path: '/admin/projects', icon: FolderOpen, label: 'Dự án' },
      { path: '/admin/activities', icon: Activity, label: 'Hoạt động' },
    ],
  },
  {
    label: 'Xuất bản',
    items: [
      { path: '/admin/blog', icon: FileText, label: 'Blog' },
      { path: '/admin/store', icon: ShoppingBag, label: 'Cửa hàng' },
      { path: '/admin/orders', icon: Package, label: 'Đơn hàng' },
      { path: '/admin/categories', icon: Tags, label: 'Danh mục' },
      { path: '/admin/vouchers', icon: Ticket, label: 'Voucher' },
      { path: '/admin/testimonials', icon: Quote, label: 'Testimonials' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { path: '/admin/contacts', icon: MessageCircle, label: 'Liên hệ' },
      { path: '/admin/bookings', icon: CalendarDays, label: 'Đặt lịch' },
      { path: '/admin/chatbot', icon: Bot, label: 'Chatbot' },
      { path: '/admin/custom-sections', icon: Blocks, label: 'Custom Sections' },
      { path: '/admin/media', icon: Image, label: 'Thư viện' },
      { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
    ],
  },
];

const allMenuItems = menuGroups.flatMap(g => g.items);

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Đã đăng xuất');
    navigate('/admin');
  };

  const currentPage = allMenuItems.find(item => location.pathname === item.path);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-[17rem] bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                <LayoutDashboard size={16} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground leading-tight">Admin Panel</h2>
                <p className="text-[10px] text-muted-foreground leading-tight">Portfolio CMS</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm border border-primary/10"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon size={16} className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-primary" : "opacity-60 group-hover:opacity-100"
                      )} />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-border space-y-0.5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg">
          <div className="flex items-center justify-between h-13 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={18} />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline text-xs">Admin</span>
                {currentPage && (
                  <>
                    <ChevronRight size={12} className="text-muted-foreground/50 hidden sm:inline" />
                    <span className="font-semibold text-foreground text-sm">{currentPage.label}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden lg:flex h-8 w-8">
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="lg:hidden h-8 w-8">
                <LogOut size={14} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
