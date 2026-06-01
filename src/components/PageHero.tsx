import { useLanguage } from '@/lib/i18n';
import { usePageHeroes } from '@/hooks/usePageHeroes';
import { stripHtml } from '@/lib/stripHtml';

interface PageHeroProps {
  pageKey: string;
  defaultTitle: { en: string; vi: string };
  defaultSubtitle: { en: string; vi: string };
  defaultLabel?: { en: string; vi: string };
  children?: React.ReactNode;
}

const PageHero = ({ pageKey, defaultTitle, defaultSubtitle, defaultLabel, children }: PageHeroProps) => {
  const { language } = useLanguage();
  const { heroes } = usePageHeroes();
  const hero = heroes?.[pageKey];

  // If hero is explicitly hidden
  if (hero?.visible === false) return null;

  const title = (language === 'en' ? hero?.title_en : hero?.title_vi) || (language === 'en' ? defaultTitle.en : defaultTitle.vi);
  const subtitle = (language === 'en' ? hero?.subtitle_en : hero?.subtitle_vi) || (language === 'en' ? defaultSubtitle.en : defaultSubtitle.vi);
  const label = (language === 'en' ? hero?.label_en : hero?.label_vi) || (defaultLabel ? (language === 'en' ? defaultLabel.en : defaultLabel.vi) : '');
  const bgImage = hero?.background_image_url;

  return (
    <section className="relative overflow-hidden bg-navy-gradient text-primary-foreground py-20 md:py-28">
      {bgImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-primary/70" />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>
      )}
      <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in">
        {label && (
          <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-3">
            {label}
          </p>
        )}
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
          {title}
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          {subtitle}
        </p>
        {children}
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
          <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default PageHero;
