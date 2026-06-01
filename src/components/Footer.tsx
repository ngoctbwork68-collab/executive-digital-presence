import { Link } from 'react-router-dom';
import { Linkedin, Github, Twitter, Mail, ArrowUpRight, Facebook, Instagram, Youtube, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { useSetting } from '@/hooks/useSettings';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLayoutSettings, type FooterStyle } from '@/hooks/useLayoutSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { stripHtml } from '@/lib/stripHtml';

const allQuickLinks = [
  { path: '/about', label: { en: 'About', vi: 'Giới thiệu' } },
  { path: '/projects', label: { en: 'Projects', vi: 'Dự án' } },
  { path: '/blog', label: { en: 'Blog', vi: 'Blog' } },
  { path: '/store', label: { en: 'Store', vi: 'Cửa hàng' } },
  { path: '/contact', label: { en: 'Contact', vi: 'Liên hệ' } },
];

const socialIconMap: Record<string, React.ElementType> = {
  linkedin: Linkedin, github: Github, twitter: Twitter, facebook: Facebook,
  instagram: Instagram, youtube: Youtube, tiktok: Globe, website: Globe,
};

const Footer = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();
  const { data: footerTagline } = useSetting('footer_tagline');
  const { data: hiddenPages } = usePageVisibility();
  const { data: siteSettings } = useSiteSettings();
  const { data: layoutSettings } = useLayoutSettings();

  const footerStyle: FooterStyle = layoutSettings?.footer_style || 'default';
  const quickLinks = allQuickLinks.filter(item => !hiddenPages?.has(item.path));

  const { data: socialLinks } = useQuery({
    queryKey: ['social_links'],
    queryFn: async () => {
      const { data, error } = await supabase.from('social_links').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: contact } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const logoUrl = siteSettings?.logo_url;
  const siteName = siteSettings?.site_name || profile?.name || 'Portfolio';

  const SocialIcons = () => (
    <>
      {socialLinks?.map((link) => {
        const Icon = socialIconMap[link.provider.toLowerCase()] || Globe;
        return (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.provider}
            className="w-10 h-10 rounded-xl bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all flex items-center justify-center">
            <Icon size={16} />
          </a>
        );
      })}
      {contact?.email && (
        <a href={`mailto:${contact.email}`}
          className="w-10 h-10 rounded-xl bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all flex items-center justify-center">
          <Mail size={16} />
        </a>
      )}
    </>
  );

  // Minimal footer
  if (footerStyle === 'minimal') {
    return (
      <footer className="bg-navy-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs opacity-50">&copy; {new Date().getFullYear()} {siteName}</p>
            <div className="flex flex-wrap items-center gap-4">
              {quickLinks.map((item) => (
                <Link key={item.path} to={item.path} className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                  {item.label[language]}
                </Link>
              ))}
            </div>
            <div className="flex gap-2">
              <SocialIcons />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Centered footer
  if (footerStyle === 'centered') {
    return (
      <footer className="bg-navy-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-12 text-center">
          <Link to="/" className="inline-block mb-4">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain brightness-0 invert mx-auto" />
            ) : (
              <span className="font-serif text-2xl font-bold text-secondary">{siteName}</span>
            )}
          </Link>
          <p className="text-sm opacity-70 max-w-md mx-auto mb-6">
            {stripHtml(footerTagline?.value || profile?.quote || '')}
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {quickLinks.map((item) => (
              <Link key={item.path} to={item.path} className="text-sm opacity-70 hover:opacity-100 hover:text-secondary transition-all">
                {item.label[language]}
              </Link>
            ))}
          </div>
          <div className="flex justify-center gap-3 mb-8">
            <SocialIcons />
          </div>
          <div className="border-t border-primary-foreground/10 pt-6 text-xs opacity-50">
            <p>&copy; {new Date().getFullYear()} {siteName}. {language === 'en' ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Default footer
  return (
    <footer className="bg-navy-gradient text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain brightness-0 invert" />
              ) : (
                <span className="font-serif text-2xl font-bold text-secondary">{siteName}</span>
              )}
            </Link>
            <p className="text-sm opacity-70 max-w-sm leading-relaxed">
              {stripHtml(footerTagline?.value || profile?.quote || '')}
            </p>
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6"><SocialIcons /></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">
              {language === 'en' ? 'Quick Links' : 'Liên kết nhanh'}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm opacity-70 hover:opacity-100 hover:text-secondary transition-all inline-flex items-center gap-1 group">
                    {item.label[language]}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">
              {language === 'en' ? 'Get in Touch' : 'Liên hệ'}
            </h3>
            <div className="space-y-3 text-sm opacity-70">
              {contact?.email && <p>{contact.email}</p>}
              {contact?.phone && <p>{contact.phone}</p>}
              {contact?.location && <p>{contact.location}</p>}
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-xs opacity-50">
          <p>&copy; {new Date().getFullYear()} {siteName}. {language === 'en' ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
