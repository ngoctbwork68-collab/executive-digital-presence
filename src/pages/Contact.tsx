import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin, Linkedin, Github, Twitter, Phone } from 'lucide-react';

const Contact = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            {language === 'en' ? "Let's Connect" : 'Liên hệ'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? "I'm always open to discussing new opportunities, collaborations, or just having a conversation."
              : 'Tôi luôn sẵn sàng thảo luận về cơ hội mới, hợp tác hoặc chỉ để trò chuyện.'}
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          {profile?.email && (
            <Card className="hover-scale">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'en' ? 'Email' : 'Email'}
                  </h3>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {profile.email}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phone */}
          {profile?.phone && (
            <Card className="hover-scale">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'en' ? 'Phone' : 'Điện thoại'}
                  </h3>
                  <a
                    href={`tel:${profile.phone}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {profile.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          {profile?.location && (
            <Card className="hover-scale">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'en' ? 'Location' : 'Vị trí'}
                  </h3>
                  <p className="text-muted-foreground">{profile.location}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social */}
          <Card className="hover-scale">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Linkedin className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  {language === 'en' ? 'Social Media' : 'Mạng xã hội'}
                </h3>
                <div className="flex gap-4 justify-center">
                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {profile?.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Github size={20} />
                    </a>
                  )}
                  {profile?.twitter_url && (
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-3xl font-bold">
            {language === 'en' ? 'Ready to collaborate?' : 'Sẵn sàng hợp tác?'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {language === 'en'
              ? "Whether you're looking for a strategic partner, seeking advisory support, or have an exciting opportunity to discuss, I'd love to hear from you."
              : 'Cho dù bạn đang tìm kiếm đối tác chiến lược, hỗ trợ tư vấn, hay có cơ hội thú vị để thảo luận, tôi rất muốn được lắng nghe.'}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
