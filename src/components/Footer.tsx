import { Linkedin, Github, Twitter, Mail } from 'lucide-react';
import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';

const Footer = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">
              {profile?.name || 'Trần Bảo Ngọc'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile ? getBilingualContent(profile, language, 'tagline') : ''}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {language === 'en' ? 'Quick Links' : 'Liên kết nhanh'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                {language === 'en' ? 'About' : 'Giới thiệu'}
              </a></li>
              <li><a href="/projects" className="text-muted-foreground hover:text-primary transition-colors">
                {language === 'en' ? 'Projects' : 'Dự án'}
              </a></li>
              <li><a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                {language === 'en' ? 'Contact' : 'Liên hệ'}
              </a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {language === 'en' ? 'Connect' : 'Kết nối'}
            </h3>
            <div className="flex gap-4">
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin size={20} />
                </a>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github size={20} />
                </a>
              )}
              {profile?.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter size={20} />
                </a>
              )}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {profile?.name || 'Trần Bảo Ngọc'}. {language === 'en' ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
