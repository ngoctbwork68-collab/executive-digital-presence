import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { useProfile } from '@/hooks/useProfile';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import { useFeaturedProjects } from '@/hooks/useProjects';
import { useFeaturedPosts } from '@/hooks/useBlog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Home = () => {
  const { language } = useLanguage();
  const { data: profile } = useProfile();
  const { data: experiences } = usePublishedExperiences();
  const { data: featuredProjects } = useFeaturedProjects();
  const { data: featuredPosts } = useFeaturedPosts();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {profile?.name || 'Trần Bảo Ngọc'}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            {profile ? getBilingualContent(profile, language, 'title') : ''}
          </p>
          <p className="text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
            {profile ? getBilingualContent(profile, language, 'tagline') : ''}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link to="/about">
                {language === 'en' ? 'About Me' : 'Về tôi'}
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                {language === 'en' ? 'Get in Touch' : 'Liên hệ'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12 text-center">
            {language === 'en' ? 'Featured Projects' : 'Dự án nổi bật'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects?.slice(0, 3).map((project) => (
              <Card key={project.id} className="hover-scale overflow-hidden group">
                {project.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.image_url}
                      alt={getBilingualContent(project, language, 'title')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-2">
                    {getBilingualContent(project, language, 'title')}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {getBilingualContent(project, language, 'description')}
                  </p>
                  <Link
                    to={`/projects/${project.slug}`}
                    className="text-primary font-medium text-sm inline-flex items-center hover:underline"
                  >
                    {language === 'en' ? 'View Project' : 'Xem chi tiết'}
                    <ArrowRight className="ml-1" size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/projects">
                {language === 'en' ? 'View All Projects' : 'Xem tất cả dự án'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Experience Highlight */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-3xl font-bold mb-2">
                {experiences?.length || 0}+
              </h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Years Experience' : 'Năm kinh nghiệm'}
              </p>
            </div>
            <div className="p-8">
              <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-3xl font-bold mb-2">
                {featuredProjects?.length || 0}+
              </h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Projects Completed' : 'Dự án hoàn thành'}
              </p>
            </div>
            <div className="p-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-3xl font-bold mb-2">
                {featuredPosts?.length || 0}+
              </h3>
              <p className="text-muted-foreground">
                {language === 'en' ? 'Articles Written' : 'Bài viết'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {featuredPosts && featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12 text-center">
              {language === 'en' ? 'Latest Insights' : 'Bài viết mới nhất'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPosts.slice(0, 3).map((post) => (
                <Card key={post.id} className="hover-scale">
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">
                      {new Date(post.published_at || post.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}
                    </div>
                    <h3 className="font-semibold text-xl mb-3">
                      {getBilingualContent(post, language, 'title')}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {getBilingualContent(post, language, 'excerpt')}
                    </p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-primary font-medium text-sm inline-flex items-center hover:underline"
                    >
                      {language === 'en' ? 'Read More' : 'Đọc thêm'}
                      <ArrowRight className="ml-1" size={16} />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link to="/blog">
                  {language === 'en' ? 'View All Articles' : 'Xem tất cả bài viết'}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;
