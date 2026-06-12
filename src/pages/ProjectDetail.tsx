import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useProjectBySlug } from '@/hooks/useProjects';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import RichContent from '@/components/RichContent';

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data: project, isLoading } = useProjectBySlug(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-12 bg-muted rounded w-2/3" />
            <div className="h-80 bg-muted rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">
            {language === 'en' ? 'Project Not Found' : 'Không tìm thấy dự án'}
          </h1>
          <Button asChild>
            <Link to="/projects">
              <ArrowLeft className="mr-2" size={16} />
              {language === 'en' ? 'Back to Projects' : 'Quay lại dự án'}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Premium Hero Image */}
      {project.image_url && (
        <div className="relative w-full aspect-[21/9] md:aspect-[21/8] max-h-[60vh] overflow-hidden bg-muted">
          <img
            src={project.image_url}
            alt={project.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover scale-105 animate-fade-in"
            style={{ objectPosition: 'center 30%' }}
            onLoad={(e) => {
              const i = e.currentTarget;
              if (i.naturalWidth < 32 || i.naturalHeight < 32) i.style.display = 'none';
            }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
        </div>
      )}


      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className={project.image_url ? '-mt-24 relative z-10' : 'pt-12'}>
            <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground">
              <Link to="/projects">
                <ArrowLeft className="mr-2" size={16} />
                {language === 'en' ? 'All Projects' : 'Tất cả dự án'}
              </Link>
            </Button>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-secondary/30 text-secondary">{project.category}</Badge>
                {project.technologies?.map((tech, i) => (
                  <Badge key={i} className="bg-muted text-muted-foreground border-0 text-xs">{tech}</Badge>
                ))}
              </div>

              <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight">{project.title}</h1>

              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-secondary hover:underline font-medium">
                  <ExternalLink size={14} />
                  {language === 'en' ? 'Visit Live Project' : 'Truy cập dự án'}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <p className="text-lg text-muted-foreground leading-relaxed">{project.description}</p>

          {project.challenge && (
            <Card className="border-0 bg-muted/40 shadow-sm">
              <CardContent className="p-8">
                <h2 className="font-serif text-2xl font-bold mb-4 text-foreground">
                  {language === 'en' ? 'The Challenge' : 'Thách thức'}
                </h2>
                <RichContent html={project.challenge} className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary" />
              </CardContent>
            </Card>
          )}

          {project.solution && (
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">
                {language === 'en' ? 'Solution' : 'Giải pháp'}
              </h2>
              <RichContent html={project.solution} className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary" />
            </div>
          )}

          {project.full_description && (
            <RichContent html={project.full_description} className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary" />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
