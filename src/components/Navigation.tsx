import { useState } from 'react';
import SmartImage from '@/components/SmartImage';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { normalizeHiddenPages, usePageVisibility } from '@/hooks/usePageVisibility';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLayoutSettings, type HeaderStyle } from '@/hooks/useLayoutSettings';
import { cn } from '@/lib/utils';

const allNavItems = [
  { path: '/', label: { en: 'Home', vi: 'Trang chủ' } },
  { path: '/about', label: { en: 'About', vi: 'Giới thiệu' } },
  { path: '/projects', label: { en: 'Projects', vi: 'Dự án' } },
  { path: '/blog', label: { en: 'Blog', vi: 'Blog' } },
  { path: '/store', label: { en: 'Store', vi: 'Cửa hàng' } },
  { path: '/contact', label: { en: 'Contact', vi: 'Liên hệ' } },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { data: hiddenPages } = usePageVisibility();
  const { data: siteSettings } = useSiteSettings();
  const { data: layoutSettings } = useLayoutSettings();

  const headerStyle: HeaderStyle = layoutSettings?.header_style || 'default';
  const safeHiddenPages = normalizeHiddenPages(hiddenPages);

  const navItems = allNavItems.filter(item =>
    item.path === '/' || !safeHiddenPages.includes(item.path)
  );

  const isActive = (path: string) => location.pathname === path;

  const logoUrl = siteSettings?.logo_url;
  const siteName = siteSettings?.site_name || 'Portfolio';

  // Centered layout: logo hidden, nav centered
  if (headerStyle === 'centered') {
    return (
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-center relative">
            {/* Mobile menu button */}
            <div className="absolute left-4 md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Centered nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label[language]}
                </Link>
              ))}
            </div>

            {/* Right side controls */}
            <div className="absolute right-4 hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
              <Button variant={language === 'vi' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden py-4 animate-fade-in">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block py-2 text-sm font-medium text-center transition-colors hover:text-primary",
                    isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label[language]}
                </Link>
              ))}
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-border">
                <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
                <Button variant={language === 'vi' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Minimal layout: just logo + hamburger
  if (headerStyle === 'minimal') {
    return (
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              {logoUrl ? (
                <SmartImage src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
              ) : (
                <span className="text-lg font-serif font-bold text-primary">{siteName}</span>
              )}
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="py-4 animate-fade-in">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block py-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label[language]}
                </Link>
              ))}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
                <Button variant={language === 'vi' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Default layout
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {logoUrl ? (
              <SmartImage src={logoUrl} alt={siteName} className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-xl font-serif font-bold text-primary">{siteName}</span>
            )}
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label[language]}
              </Link>
            ))}

            <div className="flex items-center gap-1 border-l border-border pl-4">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
              <Button variant={language === 'vi' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label[language]}
              </Link>
            ))}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>EN</Button>
              <Button variant={language === 'vi' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('vi')}>VI</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
