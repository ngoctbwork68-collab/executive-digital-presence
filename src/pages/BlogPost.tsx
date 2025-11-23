import { useParams, Link } from 'react-router-dom';
import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { usePostBySlug } from '@/hooks/useBlog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data: post, isLoading } = usePostBySlug(slug || '');

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

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Article Not Found' : 'Không tìm thấy bài viết'}
          </h1>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2" size={16} />
              {language === 'en' ? 'Back to Blog' : 'Quay lại'}
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
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="mr-2" size={16} />
              {language === 'en' ? 'Back to Blog' : 'Quay lại'}
            </Link>
          </Button>

          {/* Meta & Title */}
          <div className="space-y-6 mb-12">
            {/* Category */}
            {(post.category_en || post.category_vi) && (
              <Badge variant="secondary" className="text-sm">
                {getBilingualContent(post, language, 'category')}
              </Badge>
            )}

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              {getBilingualContent(post, language, 'title')}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="text-sm">
                  {new Date(post.published_at || post.created_at).toLocaleDateString(
                    language === 'en' ? 'en-US' : 'vi-VN',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              </div>
              {post.reading_time && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="text-sm">
                    {post.reading_time} {language === 'en' ? 'min read' : 'phút đọc'}
                  </span>
                </div>
              )}
              {post.views && (
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span className="text-sm">{post.views} {language === 'en' ? 'views' : 'lượt xem'}</span>
                </div>
              )}
            </div>

            {/* Author */}
            {post.author_name && (
              <p className="text-muted-foreground">
                {language === 'en' ? 'By' : 'Bởi'} <span className="font-medium">{post.author_name}</span>
              </p>
            )}
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-12">
              <img
                src={post.featured_image_url}
                alt={getBilingualContent(post, language, 'title')}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg">
            <div
              dangerouslySetInnerHTML={{
                __html: getBilingualContent(post, language, 'content')
              }}
            />
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
