import { Link } from 'react-router-dom';
import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { usePublishedProjects } from '@/hooks/useProjects';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink } from 'lucide-react';

const Projects = () => {
  const { language } = useLanguage();
  const { data: projects, isLoading } = usePublishedProjects();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            {language === 'en' ? 'Projects & Case Studies' : 'Dự án & Nghiên cứu'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Explore my portfolio of impactful projects and strategic initiatives.'
              : 'Khám phá danh mục các dự án có tác động và sáng kiến chiến lược của tôi.'}
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'Loading...' : 'Đang tải...'}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <Card key={project.id} className="hover-scale overflow-hidden group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Project Image */}
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={project.image_url}
                        alt={getBilingualContent(project, language, 'title')}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardContent className="p-6 space-y-4">
                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-serif text-xl font-bold mb-2 line-clamp-2">
                        {getBilingualContent(project, language, 'title')}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {getBilingualContent(project, language, 'description')}
                      </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="text-primary font-medium text-sm inline-flex items-center hover:underline"
                      >
                        {language === 'en' ? 'View Details' : 'Xem chi tiết'}
                        <ArrowRight className="ml-1" size={16} />
                      </Link>
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'No projects available.' : 'Chưa có dự án nào.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
