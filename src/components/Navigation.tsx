import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const navItems = [
    { path: '/', label: { en: 'Home', vi: 'Trang chủ' } },
    { path: '/about', label: { en: 'About', vi: 'Giới thiệu' } },
    { path: '/experience', label: { en: 'Experience', vi: 'Kinh nghiệm' } },
    { path: '/projects', label: { en: 'Projects', vi: 'Dự án' } },
    { path: '/activities', label: { en: 'Activities', vi: 'Hoạt động' } },
    { path: '/blog', label: { en: 'Blog', vi: 'Blog' } },
    { path: '/contact', label: { en: 'Contact', vi: 'Liên hệ' } },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-serif font-bold text-primary">
            {language === 'en' ? 'Trần Bảo Ngọc' : 'TRẦN BẢO NGỌC'}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label[language]}
              </Link>
            ))}
            
            {/* Language Switcher */}
            <div className="flex gap-2 border-l border-border pl-4">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'vi' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('vi')}
              >
                VI
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label[language]}
              </Link>
            ))}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'vi' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('vi')}
              >
                VI
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
