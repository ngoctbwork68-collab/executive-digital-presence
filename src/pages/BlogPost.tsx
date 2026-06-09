import { useParams, Link } from 'react-router-dom';
import SmartImage from '@/components/SmartImage';
import { useLanguage } from '@/lib/i18n';
import { usePostBySlug, usePublishedPosts, useAllCategories } from '@/hooks/useBlog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Share2, Tag, ArrowRight, BookOpen, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import RichContent from '@/components/RichContent';

const readingTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data: post, isLoading } = usePostBySlug(slug || '');
  const { data: categories } = useAllCategories();
  const { data: postsData } = usePublishedPosts(1, 50);
  const [scrollProgress, setScrollProgress] = useState(0);

  const category = post?.category_id && categories?.find(c => c.id === post.category_id);

  // Related posts (same category, excluding current)
  const relatedPosts = postsData?.posts?.filter(
    p => p.id !== post?.id && p.category_id === post?.category_id
  ).slice(0, 3) || [];

  // More posts (different category for variety)
  const morePosts = postsData?.posts?.filter(
    p => p.id !== post?.id && !relatedPosts.find(rp => rp.id === p.id)
  ).slice(0, 3) || [];

  useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById('blog-content');
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (-top) / (height - windowHeight)));
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(language === 'en' ? 'Link copied!' : 'Đã sao chép link!');
      }
    } catch { /* user cancelled */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-80 bg-muted rounded-2xl" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} className="text-muted-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">
              {language === 'en' ? 'Article Not Found' : 'Không tìm thấy bài viết'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {language === 'en' ? "The article you're looking for doesn't exist or has been removed." : 'Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.'}
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link to="/blog">
                <ArrowLeft className="mr-2" size={16} />
                {language === 'en' ? 'Back to Blog' : 'Quay lại Blog'}
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const readTime = readingTime(post.content);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <article>
        {/* Hero */}
        {post.image_url ? (
          <div className="relative w-full h-[45vh] md:h-[55vh] overflow-hidden">
            <SmartImage src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
          </div>
        ) : (
          <div className="h-24" />
        )}

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className={post.image_url ? '-mt-32 relative z-10' : 'pt-8'}>
              {/* Back */}
              <Button variant="ghost" size="sm" asChild className="mb-6 text-muted-foreground hover:text-foreground rounded-full">
                <Link to="/blog">
                  <ArrowLeft className="mr-2" size={16} />
                  {language === 'en' ? 'All Articles' : 'Tất cả bài viết'}
                </Link>
              </Button>

              {/* Category */}
              {category && (
                <Badge className="mb-4 bg-secondary/10 text-secondary border-0 hover:bg-secondary/20 rounded-full px-4 py-1">
                  <Tag size={12} className="mr-1.5" />
                  {category.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-5xl font-bold leading-[1.15] mb-6 text-foreground tracking-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="relative mb-8">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary to-secondary/30 rounded-full" />
                  <p className="text-lg text-muted-foreground leading-relaxed pl-5 italic">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border">
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Calendar size={14} className="text-primary" />
                  <span>
                    {new Date(post.created_at!).toLocaleDateString(
                      language === 'en' ? 'en-US' : 'vi-VN',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Clock size={14} className="text-primary" />
                  <span>{readTime} {language === 'en' ? 'min read' : 'phút đọc'}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto bg-muted/50 px-3 py-1.5 rounded-full hover:bg-primary/10"
                >
                  <Share2 size={14} />
                  <span>{language === 'en' ? 'Share' : 'Chia sẻ'}</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <RichContent
              id="blog-content"
              html={post.content}
              className="prose prose-lg max-w-none pb-16
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:mb-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8 prose-img:mx-auto
                prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:bg-secondary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:my-8
                prose-strong:text-foreground prose-strong:font-semibold
                prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
                prose-pre:bg-muted prose-pre:rounded-xl prose-pre:shadow-inner
                prose-li:text-muted-foreground prose-li:leading-relaxed
                prose-ul:my-4 prose-ol:my-4
                prose-hr:border-border prose-hr:my-10
                dark:prose-invert
              "
            />

            {/* Tags / Category footer */}
            {category && (
              <div className="flex items-center gap-2 pb-8 border-b border-border mb-12">
                <span className="text-sm text-muted-foreground">{language === 'en' ? 'Category:' : 'Danh mục:'}</span>
                <Badge variant="outline" className="rounded-full">
                  <Tag size={12} className="mr-1" />{category.name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-serif text-2xl md:text-3xl font-bold">
                  {language === 'en' ? 'Related Articles' : 'Bài viết liên quan'}
                </h2>
                <Link to="/blog" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {language === 'en' ? 'View all' : 'Xem tất cả'} <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((rp, i) => (
                  <Link key={rp.id} to={`/blog/${rp.slug}`} className="group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <article>
                      <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
                        {rp.image_url ? (
                          <SmartImage src={rp.image_url} alt={rp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <BookOpen size={28} className="text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{rp.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} />{new Date(rp.created_at!).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{readingTime(rp.content)} {language === 'en' ? 'min' : 'phút'}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* More posts if no related */}
      {relatedPosts.length === 0 && morePosts.length > 0 && (
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-10">
                {language === 'en' ? 'More Articles' : 'Bài viết khác'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {morePosts.map((mp, i) => (
                  <Link key={mp.id} to={`/blog/${mp.slug}`} className="group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <article>
                      <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
                        {mp.image_url ? (
                          <SmartImage src={mp.image_url} alt={mp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <BookOpen size={28} className="text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{mp.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={12} />{new Date(mp.created_at!).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{readingTime(mp.content)} {language === 'en' ? 'min' : 'phút'}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to blog */}
      <div className="container mx-auto px-4 py-14 text-center">
        <Button variant="outline" asChild size="lg" className="rounded-full px-8">
          <Link to="/blog">
            <ArrowLeft className="mr-2" size={16} />
            {language === 'en' ? 'Back to all articles' : 'Xem tất cả bài viết'}
          </Link>
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
