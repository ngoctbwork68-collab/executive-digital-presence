import { Link } from 'react-router-dom';
import { useLanguage, getBilingualContent } from '@/lib/i18n';
import { usePublishedPosts } from '@/hooks/useBlog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

const Blog = () => {
  const { language } = useLanguage();
  const { data: postsData, isLoading } = usePublishedPosts();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            {language === 'en' ? 'Insights & Articles' : 'Bài viết & Chia sẻ'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Thoughts on leadership, international relations, and professional development.'
              : 'Suy nghĩ về lãnh đạo, quan hệ quốc tế và phát triển nghề nghiệp.'}
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'Loading...' : 'Đang tải...'}
            </div>
          ) : postsData?.posts && postsData.posts.length > 0 ? (
            <div className="space-y-8">
              {postsData.posts.map((post, index) => (
                <Card key={post.id} className="hover-scale overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Featured Image */}
                    {post.featured_image_url && (
                      <div className="md:col-span-1 aspect-video md:aspect-square overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={getBilingualContent(post, language, 'title')}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <CardContent className={`${post.featured_image_url ? 'md:col-span-2' : 'md:col-span-3'} p-6 space-y-4`}>
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>
                            {new Date(post.published_at || post.created_at).toLocaleDateString(
                              language === 'en' ? 'en-US' : 'vi-VN',
                              { year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                          </span>
                        </div>
                        {post.reading_time && (
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>
                              {post.reading_time} {language === 'en' ? 'min read' : 'phút đọc'}
                            </span>
                          </div>
                        )}
                        {(post.category_en || post.category_vi) && (
                          <Badge variant="secondary">
                            {getBilingualContent(post, language, 'category')}
                          </Badge>
                        )}
                      </div>

                      {/* Title & Excerpt */}
                      <div>
                        <h2 className="font-serif text-2xl font-bold mb-3 line-clamp-2">
                          {getBilingualContent(post, language, 'title')}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                          {getBilingualContent(post, language, 'excerpt')}
                        </p>
                      </div>

                      {/* Read More */}
                      <div className="pt-4">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-primary font-medium inline-flex items-center hover:underline"
                        >
                          {language === 'en' ? 'Read Full Article' : 'Đọc toàn bộ'}
                          <ArrowRight className="ml-2" size={16} />
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              {language === 'en' ? 'No articles available.' : 'Chưa có bài viết nào.'}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
