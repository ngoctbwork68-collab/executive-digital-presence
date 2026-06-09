import { useLanguage } from '@/lib/i18n';
import SmartImage from '@/components/SmartImage';
import { useProfile } from '@/hooks/useProfile';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import { usePublishedActivities } from '@/hooks/useActivities';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import PageHero from '@/components/PageHero';
import { usePageHeroes } from '@/hooks/usePageHeroes';
import Footer from '@/components/Footer';
import CustomSections from '@/components/CustomSections';
import RichContent from '@/components/RichContent';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin, Linkedin, Github, Twitter, GraduationCap, Award, Briefcase, Calendar, ChevronRight, Activity } from 'lucide-react';

const About = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();
  const { data: experiences } = usePublishedExperiences();
  const { data: activities } = usePublishedActivities();

  const { data: aboutSection } = useQuery({
    queryKey: ['about_section'],
    queryFn: async () => {
      const { data, error } = await supabase.from('about_section').select('*').maybeSingle();
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

  const { data: contact } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase.from('skills').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: education } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const { data, error } = await supabase.from('education').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const getSocialUrl = (provider: string) => {
    return socialLinks?.find(l => l.provider.toLowerCase() === provider.toLowerCase())?.url;
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-32 w-32 rounded-full bg-muted mx-auto" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
            <div className="h-4 bg-muted rounded w-64 mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Hero Banner — toggleable from admin like other pages */}
      <PageHero
        pageKey="about"
        defaultTitle={{ en: 'About Me', vi: 'Về tôi' }}
        defaultSubtitle={{ en: 'Get to know my story, skills, and journey', vi: 'Tìm hiểu về câu chuyện, kỹ năng và hành trình của tôi' }}
        defaultLabel={{ en: 'Introduction', vi: 'Giới thiệu' }}
      />

      {/* Profile Card */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              <div className="md:col-span-1 flex justify-center">
                {profile.profile_image_url ? (
                  <div className="relative">
                    <SmartImage src={profile.profile_image_url} alt={profile.name}
                      className="w-56 h-56 md:w-full md:h-auto md:aspect-square object-cover rounded-2xl shadow-navy" />
                    <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-secondary/20 rounded-2xl -z-10" />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-muted rounded-2xl" />
                )}
              </div>
              <div className="md:col-span-2 space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-3">{profile.name}</h2>
                  <p className="text-xl text-secondary font-medium mb-4">{profile.title}</p>
                  <RichContent html={profile.quote} className="text-lg text-muted-foreground leading-relaxed prose prose-lg max-w-none dark:prose-invert" />
                </div>
                <div className="flex flex-wrap gap-6 pt-4">
                  {contact?.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail size={16} className="text-secondary" />{contact.email}
                    </a>
                  )}
                  {contact?.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={16} className="text-secondary" />{contact.location}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  {getSocialUrl('linkedin') && (
                    <a href={getSocialUrl('linkedin')} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Linkedin size={18} />
                    </a>
                  )}
                  {getSocialUrl('github') && (
                    <a href={getSocialUrl('github')} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Github size={18} />
                    </a>
                  )}
                  {getSocialUrl('twitter') && (
                    <a href={getSocialUrl('twitter')} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      <Twitter size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Description */}
      {aboutSection && (
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-3xl font-bold mb-8">{aboutSection.headline}</h2>
              <RichContent html={aboutSection.description} className="text-muted-foreground text-lg leading-relaxed prose prose-lg max-w-none dark:prose-invert" />
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Award size={24} className="text-secondary" />
              <h2 className="font-serif text-3xl font-bold">
                {language === 'en' ? 'Skills & Expertise' : 'Kỹ năng & Chuyên môn'}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span key={skill.id} className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {experiences && experiences.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <Briefcase size={24} className="text-secondary" />
                <h2 className="font-serif text-3xl font-bold">
                  {language === 'en' ? 'Professional Experience' : 'Kinh nghiệm làm việc'}
                </h2>
              </div>
              <div className="relative">
                <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border hidden md:block" />
                <div className="space-y-8">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="relative flex gap-6 md:gap-10 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="hidden md:flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-secondary border-4 border-background shadow-sm z-10" />
                      </div>
                      <Card className="flex-1 card-premium border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 md:p-8">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                              <Calendar size={12} />{exp.year}
                            </span>
                            {exp.location && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin size={12} />{exp.location}
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-2xl font-bold mb-1">{exp.title}</h3>
                          <p className="text-secondary font-medium mb-4">{exp.company}</p>
                          {exp.description && <RichContent html={exp.description} className="text-muted-foreground leading-relaxed mb-4 prose prose-sm max-w-none dark:prose-invert" />}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="pt-4 border-t border-border">
                              <h4 className="text-sm font-semibold mb-3 text-foreground">
                                {language === 'en' ? 'Key Achievements' : 'Thành tựu nổi bật'}
                              </h4>
                              <ul className="space-y-2">
                                {exp.achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <ChevronRight size={14} className="text-secondary mt-0.5 shrink-0" />
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <GraduationCap size={24} className="text-secondary" />
                <h2 className="font-serif text-3xl font-bold">
                  {language === 'en' ? 'Education' : 'Học vấn'}
                </h2>
              </div>
              <div className="space-y-6">
                {education.map((edu, index) => (
                  <Card key={edu.id} className="card-premium border-0 shadow-sm animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-serif text-xl font-bold">{edu.degree}</h3>
                          <p className="text-secondary font-medium">{edu.institution}</p>
                          {edu.field && <p className="text-sm text-muted-foreground">{edu.field}</p>}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full w-fit">{edu.year}</span>
                      </div>
                      {edu.description && (
                        <RichContent html={edu.description} className="text-muted-foreground leading-relaxed mt-3 prose prose-sm max-w-none dark:prose-invert" />
                      )}
                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {edu.achievements.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />{a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Activities */}
      {activities && activities.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <Activity size={24} className="text-secondary" />
                <h2 className="font-serif text-3xl font-bold">
                  {language === 'en' ? 'Activities & Leadership' : 'Hoạt động & Lãnh đạo'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activities.map((activity, index) => (
                  <Card key={activity.id} className="card-premium overflow-hidden group border-0 shadow-md animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                    {activity.image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <SmartImage src={activity.image_url} alt={activity.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-navy-gradient flex items-center justify-center">
                        <Activity size={48} className="text-secondary opacity-50" />
                      </div>
                    )}
                    <CardContent className="p-6 space-y-3">
                      <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">{activity.title}</h3>
                      {activity.description && (
                        <RichContent html={activity.description} className="text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <CustomSections page="about" />
      <Footer />
    </div>
  );
};

export default About;
