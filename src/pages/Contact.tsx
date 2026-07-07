import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import PageHero from '@/components/PageHero';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CustomSections from '@/components/CustomSections';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Linkedin, Github, Twitter, Phone, Send, MessageSquare, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingForm from '@/components/BookingForm';
import { safeMapEmbedUrl, FALLBACK_MAP_EMBED } from '@/lib/mapEmbed';


const Contact = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const { data: contact } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: socialLinks } = useQuery({
    queryKey: ['social_links'],
    queryFn: async () => {
      const { data, error } = await supabase.from('social_links').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const getSocialUrl = (provider: string) => {
    return socialLinks?.find(l => l.provider.toLowerCase() === provider.toLowerCase())?.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message,
      });
      if (error) throw error;
      toast({
        title: language === 'en' ? 'Message sent!' : 'Đã gửi tin nhắn!',
        description: language === 'en' ? "Thank you! I'll get back to you soon." : 'Cảm ơn bạn! Tôi sẽ phản hồi sớm.',
      });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast({
        title: language === 'en' ? 'Error' : 'Lỗi',
        description: language === 'en' ? 'Failed to send message. Please try again.' : 'Gửi tin nhắn thất bại. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <PageHero
        pageKey="contact"
        defaultTitle={{ en: "Let's Connect", vi: 'Kết nối với tôi' }}
        defaultSubtitle={{ en: "I'm always open to discussing new opportunities, collaborations, or just having a conversation.", vi: 'Tôi luôn sẵn sàng thảo luận về cơ hội mới, hợp tác hoặc chỉ để trò chuyện.' }}
        defaultLabel={{ en: 'Contact', vi: 'Liên hệ' }}
      />

      {/* Contact Content */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form / Booking tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="message" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 rounded-lg">
                <TabsTrigger value="message" className="rounded-md gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {language === 'en' ? 'Message' : 'Tin nhắn'}
                </TabsTrigger>
                <TabsTrigger value="booking" className="rounded-md gap-2">
                  <CalendarDays className="w-4 h-4" />
                  {language === 'en' ? 'Book a meeting' : 'Đặt lịch'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="message">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="font-serif text-2xl font-bold mb-6">
                      {language === 'en' ? 'Send a Message' : 'Gửi tin nhắn'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">
                            {language === 'en' ? 'Full Name' : 'Họ và tên'} *
                          </label>
                          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder={language === 'en' ? 'Your name' : 'Tên của bạn'} className="rounded-lg" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Email *</label>
                          <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="email@example.com" className="rounded-lg" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          {language === 'en' ? 'Phone (optional)' : 'Số điện thoại (tùy chọn)'}
                        </label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+84..." className="rounded-lg" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">
                          {language === 'en' ? 'Message' : 'Tin nhắn'} *
                        </label>
                        <Textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder={language === 'en' ? 'How can I help you?' : 'Tôi có thể giúp gì cho bạn?'}
                          rows={5} className="rounded-lg resize-none" />
                      </div>
                      <Button type="submit" size="lg" disabled={sending} className="w-full rounded-lg gold-shine">
                        {sending ? (
                          <span className="animate-pulse">{language === 'en' ? 'Sending...' : 'Đang gửi...'}</span>
                        ) : (
                          <>
                            <Send size={18} className="mr-2" />
                            {language === 'en' ? 'Send Message' : 'Gửi tin nhắn'}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="booking">
                <BookingForm />
              </TabsContent>
            </Tabs>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {contact?.email && (
              <Card className="card-premium border-0 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${contact.email}`} className="font-medium text-foreground hover:text-primary transition-colors text-sm">
                      {contact.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {contact?.phone && (
              <Card className="card-premium border-0 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Phone' : 'Điện thoại'}</p>
                    <a href={`tel:${contact.phone}`} className="font-medium text-foreground hover:text-primary transition-colors text-sm">
                      {contact.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {contact?.location && (
              <Card className="card-premium border-0 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Location' : 'Địa điểm'}</p>
                    <p className="font-medium text-foreground text-sm">{contact.location}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social */}
            <Card className="card-premium border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'en' ? 'Connect on Social' : 'Kết nối mạng xã hội'}
                </p>
                <div className="flex gap-3">
                  {getSocialUrl('linkedin') && (
                    <a href={getSocialUrl('linkedin')} target="_blank" rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Linkedin size={18} />
                    </a>
                  )}
                  {getSocialUrl('github') && (
                    <a href={getSocialUrl('github')} target="_blank" rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Github size={18} />
                    </a>
                  )}
                  {getSocialUrl('twitter') && (
                    <a href={getSocialUrl('twitter')} target="_blank" rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Twitter size={18} />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map */}
      {(() => {
        const FALLBACK = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d476855.7336670022!2d105.3230731579968!3d20.975176246258698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1777937845356!5m2!1svi!2s";
        const raw = (contact?.map_embed_url || '').trim();
        // Decode common HTML entities so pasted iframe HTML parses correctly
        const decoded = raw
          .replace(/&quot;/g, '"')
          .replace(/&#34;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/&amp;/g, '&');
        // Find the LAST src="..." in case user pasted nested iframe HTML
        let mapSrc = FALLBACK;
        const matches = [...decoded.matchAll(/src\s*=\s*["']([^"']+)["']/gi)];
        if (matches.length) {
          const candidate = matches[matches.length - 1][1];
          if (/^https:\/\/(www\.)?google\.com\/maps\/embed/i.test(candidate)) mapSrc = candidate;
        } else if (/^https:\/\/(www\.)?google\.com\/maps\/embed/i.test(decoded)) {
          mapSrc = decoded;
        }
        return (
          <section className="container mx-auto px-4 pb-16">
            <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src={mapSrc}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          </section>
        );
      })()}


      <CustomSections page="contact" />
      <Footer />
    </div>
  );
};

export default Contact;
