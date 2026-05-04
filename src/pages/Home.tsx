import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Briefcase, TrendingUp, Users, Sparkles, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import { useFeaturedProjects } from '@/hooks/useProjects';
import { useFeaturedPosts } from '@/hooks/useBlog';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { usePublishedTestimonials } from '@/hooks/useTestimonials';
import { useSetting } from '@/hooks/useSettings';
import CountUp from '@/components/CountUp';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CustomSections from '@/components/CustomSections';
import RichContent from '@/components/RichContent';
import { useHomeSectionsOrder, useHomeSectionsVisibility, type HomeSectionId } from '@/hooks/useHomeSections';

/* ── Scroll Reveal wrapper ── */
const RevealSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal(0.12);
  return (
    <div
      ref={ref}
      className={`scroll-hidden ${isVisible ? 'scroll-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};


const Home = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();
  const { data: experiences } = usePublishedExperiences();
  const { data: featuredProjects } = useFeaturedProjects();
  const { data: featuredPosts } = useFeaturedPosts();
  const { data: testimonials } = usePublishedTestimonials();
  const { data: showTestimonialsSetting } = useSetting('show_testimonials');
  const showTestimonials = showTestimonialsSetting?.value !== 'false';
  const { data: showHeroButtonsSetting } = useSetting('show_hero_buttons');
  const showHeroButtons = showHeroButtonsSetting?.value !== 'false';
  const { data: sectionsOrder } = useHomeSectionsOrder();
  const { data: sectionsVisibility } = useHomeSectionsVisibility();

  /* ── Parallax state ── */
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Stats scroll reveal ── */
  const statsReveal = useScrollReveal(0.2);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} className="relative overflow-hidden bg-navy-gradient text-primary-foreground">
        {/* Custom background image */}
        {profile?.background_image_url && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <img
              src={profile.background_image_url}
              alt=""
              className="w-full h-full object-cover"
              style={{ transform: `translateY(${scrollY * 0.2}px) scale(1.1)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
          </div>
        )}
        {/* Parallax orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="orb-gold w-72 h-72 top-10 left-[5%] animate-pulse-glow"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          />
          <div
            className="orb-gold w-48 h-48 bottom-20 right-[10%] animate-pulse-glow"
            style={{ transform: `translateY(${scrollY * -0.1}px)`, animationDelay: '2s' }}
          />
          <div
            className="orb-navy w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float"
            style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.08}px))` }}
          />
          {/* Geometric accents */}
          <div
            className="absolute w-px h-40 bg-gradient-to-b from-transparent via-[hsl(var(--gold-main)/0.3)] to-transparent top-16 left-[20%] animate-float-delayed"
          />
          <div
            className="absolute w-px h-32 bg-gradient-to-b from-transparent via-[hsl(var(--gold-main)/0.2)] to-transparent top-24 right-[25%] animate-float"
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-[hsl(var(--gold-main)/0.5)] top-[30%] left-[15%] animate-float"
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold-light)/0.4)] top-[60%] right-[20%] animate-float-delayed"
          />
        </div>

        <div className="container mx-auto px-4 py-28 md:py-40 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Staggered entrance */}
            <div className="animate-fade-in" style={{ animationDuration: '0.6s', animationDelay: '0.1s', animationFillMode: 'both' }}>
              <div className="inline-flex items-center gap-2 bg-[hsl(var(--gold-main)/0.15)] text-[hsl(var(--gold-light))] px-5 py-2.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-[hsl(var(--gold-main)/0.2)]">
                <Sparkles size={14} />
                {language === 'en' ? 'Sales & Business Development' : 'Kinh doanh & Phát triển'}
              </div>
            </div>

            <h1
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-fade-in"
              style={{ animationDuration: '0.8s', animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              {profile?.name || 'Portfolio'}
            </h1>

            <p
              className="text-xl md:text-2xl opacity-90 mb-4 font-light animate-fade-in"
              style={{ animationDuration: '0.8s', animationDelay: '0.5s', animationFillMode: 'both' }}
            >
              {profile?.title || ''}
            </p>

            <RichContent
              html={profile?.quote || ''}
              className="text-lg opacity-60 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in prose prose-lg prose-invert max-w-none [&_p]:m-0"
            />

            {showHeroButtons && (
              <div
                className="flex gap-4 justify-center flex-wrap animate-fade-in"
                style={{ animationDuration: '0.8s', animationDelay: '0.9s', animationFillMode: 'both' }}
              >
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold gold-shine rounded-full px-8 text-base" asChild>
                  <Link to="/about">
                    {language === 'en' ? 'About Me' : 'Về tôi'}
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[hsl(var(--gold-main)/0.3)] text-primary-foreground hover:bg-[hsl(var(--gold-main)/0.1)] rounded-full px-8 text-base" asChild>
                  <Link to="/contact">
                    {language === 'en' ? 'Get in Touch' : 'Liên hệ'}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 80L1440 80L1440 0C1440 0 1200 70 720 50C240 30 0 60 0 60L0 80Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {(() => {
        const sectionMap: Record<HomeSectionId, React.ReactNode> = {
          stats: ((experiences && experiences.length > 0) || (featuredProjects && featuredProjects.length > 0) || (featuredPosts && featuredPosts.length > 0)) ? (
            <section key="stats" className="container mx-auto px-4 -mt-6 relative z-20">
              <div ref={statsReveal.ref} className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Briefcase, value: experiences?.length || 0, label: language === 'en' ? 'Years Experience' : 'Năm kinh nghiệm', color: 'text-primary' },
                    { icon: TrendingUp, value: featuredProjects?.length || 0, label: language === 'en' ? 'Projects Completed' : 'Dự án hoàn thành', color: 'text-secondary' },
                    { icon: Users, value: featuredPosts?.length || 0, label: language === 'en' ? 'Articles Written' : 'Bài viết', color: 'text-primary' },
                  ].map((stat, i) => (
                    <Card key={i} className={`card-premium border-0 shadow-lg scroll-hidden ${statsReveal.isVisible ? 'scroll-visible' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }}>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-muted flex items-center justify-center ${stat.color}`}>
                          <stat.icon size={24} />
                        </div>
                        <div>
                          <p className="font-serif text-3xl font-bold"><CountUp end={stat.value} trigger={statsReveal.isVisible} /></p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          ) : null,

          projects: featuredProjects && featuredProjects.length > 0 ? (
            <section key="projects" className="container mx-auto px-4 py-24">
              <div className="max-w-6xl mx-auto">
                <RevealSection>
                  <div className="flex items-end justify-between mb-12">
                    <div>
                      <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">{language === 'en' ? 'Portfolio' : 'Danh mục'}</p>
                      <h2 className="font-serif text-3xl md:text-4xl font-bold">{language === 'en' ? 'Featured Projects' : 'Dự án nổi bật'}</h2>
                    </div>
                    <Button variant="ghost" className="hidden md:inline-flex text-primary" asChild>
                      <Link to="/projects">{language === 'en' ? 'View All' : 'Xem tất cả'}<ArrowRight className="ml-1" size={16} /></Link>
                    </Button>
                  </div>
                </RevealSection>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredProjects.slice(0, 3).map((project, i) => (
                    <RevealSection key={project.id} delay={i * 0.12}>
                      <Card className="card-premium overflow-hidden group border-0 shadow-md h-full">
                        {project.image_url && (
                          <div className="aspect-video overflow-hidden relative">
                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="font-serif font-bold text-xl mb-2 group-hover:text-secondary transition-colors duration-300">{project.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
                          <Link to={`/projects/${project.slug}`} className="text-secondary font-medium text-sm inline-flex items-center gap-1 hover:gap-2 transition-all duration-300">
                            {language === 'en' ? 'View Project' : 'Xem chi tiết'}<ArrowRight size={16} />
                          </Link>
                        </CardContent>
                      </Card>
                    </RevealSection>
                  ))}
                </div>
                <div className="text-center mt-10 md:hidden">
                  <Button variant="outline" asChild><Link to="/projects">{language === 'en' ? 'View All Projects' : 'Xem tất cả dự án'}</Link></Button>
                </div>
              </div>
            </section>
          ) : null,

          testimonials: showTestimonials && testimonials && testimonials.length > 0 ? (
            <section key="testimonials" className="py-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-muted/30" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold-main)/0.3)] to-transparent" />
              <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                  <RevealSection>
                    <div className="text-center mb-14">
                      <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">{language === 'en' ? 'Testimonials' : 'Nhận xét'}</p>
                      <h2 className="font-serif text-3xl md:text-4xl font-bold">{language === 'en' ? 'What People Say' : 'Mọi người nói gì'}</h2>
                    </div>
                  </RevealSection>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                      <RevealSection key={t.id} delay={i * 0.15}>
                        <Card className="card-premium border-0 shadow-md h-full relative overflow-hidden group">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--gold-dark))] via-[hsl(var(--gold-main))] to-[hsl(var(--gold-light))] opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                          <CardContent className="p-8">
                            <Quote size={32} className="text-secondary/30 mb-4" />
                            <p className="text-foreground/80 leading-relaxed mb-6 italic">"{language === 'en' ? (t.quote_en || t.quote_vi) : t.quote_vi}"</p>
                            <div className="flex items-center gap-3">
                              {t.avatar_url ? (
                                <img src={t.avatar_url} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-secondary/20" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">👤</div>
                              )}
                              <div>
                                <p className="font-serif font-bold text-sm">{t.name}</p>
                                <p className="text-xs text-muted-foreground">{language === 'en' ? (t.role_en || t.role_vi) : t.role_vi}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </RevealSection>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold-main)/0.3)] to-transparent" />
            </section>
          ) : null,

          blog: featuredPosts && featuredPosts.length > 0 ? (
            <section key="blog" className="py-24">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <RevealSection>
                    <div className="flex items-end justify-between mb-12">
                      <div>
                        <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">Blog</p>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold">{language === 'en' ? 'Latest Insights' : 'Bài viết mới nhất'}</h2>
                      </div>
                      <Button variant="ghost" className="hidden md:inline-flex text-primary" asChild>
                        <Link to="/blog">{language === 'en' ? 'View All' : 'Xem tất cả'}<ArrowRight className="ml-1" size={16} /></Link>
                      </Button>
                    </div>
                  </RevealSection>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredPosts.slice(0, 3).map((post, i) => (
                      <RevealSection key={post.id} delay={i * 0.12}>
                        <Link to={`/blog/${post.slug}`} className="group block h-full">
                          <Card className="card-premium h-full border-0 shadow-md overflow-hidden">
                            {post.image_url && (
                              <div className="aspect-video overflow-hidden">
                                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              </div>
                            )}
                            <CardContent className="p-6">
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(post.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-secondary transition-colors duration-300 line-clamp-2">{post.title}</h3>
                              {post.excerpt && (<p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>)}
                            </CardContent>
                          </Card>
                        </Link>
                      </RevealSection>
                    ))}
                  </div>
                  <div className="text-center mt-10 md:hidden">
                    <Button variant="outline" asChild><Link to="/blog">{language === 'en' ? 'View All Articles' : 'Xem tất cả bài viết'}</Link></Button>
                  </div>
                </div>
              </div>
            </section>
          ) : null,

          cta: (
            <section key="cta" className="container mx-auto px-4 py-24">
              <RevealSection>
                <div className="max-w-4xl mx-auto">
                  <Card className="bg-navy-gradient text-primary-foreground border-0 overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                      <div className="orb-gold w-48 h-48 -top-10 -right-10 animate-pulse-glow" style={{ transform: `translateY(${scrollY * -0.05}px)` }} />
                      <div className="orb-gold w-32 h-32 -bottom-8 -left-8 animate-pulse-glow" style={{ animationDelay: '1.5s', transform: `translateY(${scrollY * 0.03}px)` }} />
                    </div>
                    <CardContent className="p-12 md:p-20 text-center relative z-10">
                      <h2 className="font-serif text-3xl md:text-5xl font-bold mb-5">{language === 'en' ? 'Ready to collaborate?' : 'Sẵn sàng hợp tác?'}</h2>
                      <p className="text-lg opacity-70 mb-10 max-w-xl mx-auto leading-relaxed">
                        {language === 'en' ? "Let's discuss how we can create value together." : 'Hãy cùng thảo luận về cách chúng ta có thể tạo giá trị cùng nhau.'}
                      </p>
                      <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-10 shadow-gold gold-shine text-base" asChild>
                        <Link to="/contact">{language === 'en' ? 'Get in Touch' : 'Liên hệ ngay'}<ArrowRight className="ml-2" size={20} /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </RevealSection>
            </section>
          ),

          custom: <CustomSections key="custom" page="home" />,
        };
        return (sectionsOrder || []).filter(id => sectionsVisibility?.[id] !== false).map(id => sectionMap[id]);
      })()}

      <Footer />
    </div>
  );
};

export default Home;

