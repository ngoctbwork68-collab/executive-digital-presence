import { useState } from 'react';
import SmartImage from '@/components/SmartImage';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { usePublishedPosts, useFeaturedPosts, useAllCategories } from '@/hooks/useBlog';
import PageHero from '@/components/PageHero';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CustomSections from '@/components/CustomSections';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Clock, Search, Star, Tag, BookOpen } from 'lucide-react';

const readingTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

const Blog = () => {
  const { language } = useLanguage();
  const { data: postsData, isLoading } = usePublishedPosts(1, 50);
  const { data: featuredPosts } = useFeaturedPosts(3);
  const { data: categories } = useAllCategories();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const posts = postsData?.posts || [];
  const filtered = posts.filter(p => {
    const matchSearch = !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || p.category_id === activeCategory;
    return matchSearch && matchCategory;
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !categories) return null;
    return categories.find(c => c.id === categoryId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <PageHero
        pageKey="blog"
        defaultTitle={{ en: 'Insights & Articles', vi: 'Bài viết & Chia sẻ' }}
        defaultSubtitle={{ en: 'Thoughts on leadership, international relations, and professional development.', vi: 'Chia sẻ về lãnh đạo, quan hệ quốc tế và phát triển nghề nghiệp.' }}
        defaultLabel={{ en: 'Blog', vi: 'Blog' }}
      >
        <div className="max-w-lg mx-auto relative mt-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'en' ? 'Search articles...' : 'Tìm kiếm bài viết...'}
            className="pl-11 h-12 bg-background/95 backdrop-blur-sm text-foreground rounded-full border-none shadow-xl text-base"
          />
        </div>
      </PageHero>

      {/* Featured Hero Post */}
      {!search && !activeCategory && featuredPosts && featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 -mt-10 relative z-10 mb-16">
          <div className="max-w-6xl mx-auto">
            {/* Main featured */}
            <Link to={`/blog/${featuredPosts[0].slug}`} className="group block mb-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[21/9] md:aspect-[21/8]">
                  {featuredPosts[0].image_url ? (
                    <SmartImage src={featuredPosts[0].image_url} alt={featuredPosts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 flex items-center justify-center">
                      <BookOpen size={64} className="text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-secondary text-secondary-foreground border-0 shadow-lg">
                      <Star size={12} className="mr-1" />
                      {language === 'en' ? 'Featured' : 'Nổi bật'}
                    </Badge>
                    {(() => { const cat = getCategoryName(featuredPosts[0].category_id); return cat ? <Badge variant="outline" className="border-white/30 text-white/90">{cat.name}</Badge> : null; })()}
                  </div>
                  <h2 className="font-serif text-2xl md:text-4xl font-bold text-white mb-3 group-hover:text-secondary transition-colors duration-300 line-clamp-2">
                    {featuredPosts[0].title}
                  </h2>
                  {featuredPosts[0].excerpt && (
                    <p className="text-white/70 text-sm md:text-base line-clamp-2 max-w-2xl mb-4">{featuredPosts[0].excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span className="flex items-center gap-1.5"><Calendar size={14} />{new Date(featuredPosts[0].created_at!).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} />{readingTime(featuredPosts[0].content)} {language === 'en' ? 'min read' : 'phút đọc'}</span>
                    <span className="flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-secondary">
                      {language === 'en' ? 'Read article' : 'Đọc bài viết'} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Secondary featured */}
            {featuredPosts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredPosts.slice(1, 3).map((post, i) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                      <div className="flex h-full">
                        {post.image_url && (
                          <div className="w-40 md:w-48 shrink-0 overflow-hidden">
                            <SmartImage src={post.image_url} alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <CardContent className="p-5 flex flex-col justify-center flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs border-0">
                              <Star size={10} className="mr-1" />{language === 'en' ? 'Featured' : 'Nổi bật'}
                            </Badge>
                          </div>
                          <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                            <span className="flex items-center gap-1"><Calendar size={12} />{new Date(post.created_at!).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}</span>
                            <span className="flex items-center gap-1"><Clock size={12} />{readingTime(post.content)} {language === 'en' ? 'min' : 'phút'}</span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !activeCategory
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {language === 'en' ? 'All' : 'Tất cả'}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Tag size={12} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts — Magazine Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {search && (
            <h2 className="font-serif text-2xl font-bold mb-8 text-foreground">
              {language === 'en' ? `Results for "${search}"` : `Kết quả cho "${search}"`}
              <span className="text-muted-foreground text-lg font-normal ml-2">({filtered.length})</span>
            </h2>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[16/10] bg-muted rounded-xl" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => {
                const cat = getCategoryName(post.category_id);
                return (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group block animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <article className="h-full flex flex-col">
                      {/* Image */}
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
                        {post.image_url ? (
                          <SmartImage src={post.image_url} alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <BookOpen size={32} className="text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-background/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                            <ArrowRight size={18} className="text-primary" />
                          </div>
                        </div>
                        {/* Category badge */}
                        {cat && (
                          <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-sm text-xs">
                            {cat.name}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Calendar size={12} />{new Date(post.created_at!).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span className="flex items-center gap-1"><Clock size={12} />{readingTime(post.content)} {language === 'en' ? 'min' : 'phút'}</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                        )}
                        <div className="mt-auto pt-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {language === 'en' ? 'Read more' : 'Đọc thêm'} <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{language === 'en' ? 'No articles found' : 'Không tìm thấy bài viết'}</h3>
              <p className="text-muted-foreground text-sm">{language === 'en' ? 'Try adjusting your search or filter criteria.' : 'Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.'}</p>
            </div>
          )}
        </div>
      </section>

      <CustomSections page="blog" />
      <Footer />
    </div>
  );
};

export default Blog;
