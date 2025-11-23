import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, MapPin, Linkedin, Github, Twitter } from 'lucide-react';

const About = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading...' : 'Đang tải...'}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            {/* Profile Image */}
            <div className="md:col-span-1">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-full aspect-square object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-muted rounded-lg" />
              )}
            </div>

            {/* Profile Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="font-serif text-4xl font-bold mb-2">
                  {profile.name}
                </h1>
                <p className="text-xl text-primary mb-4">
                  {getBilingualContent(profile, language, 'title')}
                </p>
                <p className="text-lg text-muted-foreground">
                  {getBilingualContent(profile, language, 'tagline')}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t border-border">
                {profile.email && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail size={20} className="text-primary" />
                    <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin size={20} className="text-primary" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Github size={20} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Twitter size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl font-bold mb-8">
              {language === 'en' ? 'Professional Summary' : 'Tóm tắt'}
            </h2>
            <div className="prose prose-lg max-w-none text-foreground">
              <p className="text-muted-foreground leading-relaxed">
                {getBilingualContent(profile, language, 'summary')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      {(profile.story_en || profile.story_vi) && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl font-bold mb-8">
              {language === 'en' ? 'My Story' : 'Câu chuyện của tôi'}
            </h2>
            <div className="prose prose-lg max-w-none text-foreground">
              <div
                className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: getBilingualContent(profile, language, 'story')
                }}
              />
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default About;
