import { useParams, Link } from 'react-router-dom';
import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { useProjectBySlug } from '@/hooks/useProjects';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data: project, isLoading } = useProjectBySlug(slug || '');

  if (isLoading) {
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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">
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

      {/* Header */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/projects">
              <ArrowLeft className="mr-2" size={16} />
              {language === 'en' ? 'Back to Projects' : 'Quay lại'}
            </Link>
          </Button>

          <div className="space-y-6">
            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              {getBilingualContent(project, language, 'title')}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              {project.project_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    {new Date(project.project_date).toLocaleDateString(
                      language === 'en' ? 'en-US' : 'vi-VN',
                      { year: 'numeric', month: 'long' }
                    )}
                  </span>
                </div>
              )}
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <ExternalLink size={16} />
                  <span>{language === 'en' ? 'Visit Project' : 'Truy cập dự án'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {project.image_url && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <img
              src={project.image_url}
              alt={getBilingualContent(project, language, 'title')}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Description */}
          {(project.description_en || project.description_vi) && (
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {getBilingualContent(project, language, 'description')}
              </p>
            </div>
          )}

          {/* Problem */}
          {(project.problem_en || project.problem_vi) && (
            <div className="bg-muted/30 p-8 rounded-lg">
              <h2 className="font-serif text-2xl font-bold mb-4">
                {language === 'en' ? 'The Challenge' : 'Thách thức'}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {getBilingualContent(project, language, 'problem')}
              </p>
            </div>
          )}

          {/* Action */}
          {(project.action_en || project.action_vi) && (
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">
                {language === 'en' ? 'Approach & Solution' : 'Phương pháp & Giải pháp'}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {getBilingualContent(project, language, 'action')}
              </p>
            </div>
          )}

          {/* Gallery */}
          {project.gallery_urls && project.gallery_urls.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6">
                {language === 'en' ? 'Project Gallery' : 'Thư viện hình ảnh'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.gallery_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${getBilingualContent(project, language, 'title')} - ${i + 1}`}
                    className="w-full rounded-lg shadow-md"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {(project.result_en || project.result_vi) && (
            <div className="bg-primary/5 p-8 rounded-lg border border-primary/20">
              <h2 className="font-serif text-2xl font-bold mb-4">
                {language === 'en' ? 'Results & Impact' : 'Kết quả & Tác động'}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {getBilingualContent(project, language, 'result')}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
