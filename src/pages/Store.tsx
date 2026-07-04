import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublishedProducts, useProductCategories } from '@/hooks/useStore';
import { useLanguage } from '@/lib/i18n';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import CustomSections from '@/components/CustomSections';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag, BookOpen, FileText, Package, Filter, Clock, User, Sparkles, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PRODUCT_TYPES = [
  { value: '', label: { en: 'All', vi: 'Tất cả' }, icon: Filter },
  { value: 'product', label: { en: 'Products', vi: 'Vật phẩm' }, icon: Package },
  { value: 'course', label: { en: 'Courses', vi: 'Khóa học' }, icon: BookOpen },
  { value: 'ebook', label: { en: 'Ebooks', vi: 'Tài liệu' }, icon: FileText },
];

export default function Store() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'newest'>('default');

  const { data: products, isLoading } = usePublishedProducts(typeFilter || undefined);
  const { data: categories } = useProductCategories();

  const filtered = (products?.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.category_id !== categoryFilter) return false;
    return true;
  }) || []).slice().sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
    // default: featured first, then sort_order
    if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getDiscountedPrice = (price: number, discount: number | null) =>
    discount ? price * (1 - discount / 100) : price;

  const typeLabels: Record<string, string> = { product: 'Vật phẩm', course: 'Khóa học', ebook: 'Tài liệu' };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageHero pageKey="store" defaultTitle={{ en: 'Store', vi: 'Cửa hàng' }} defaultSubtitle={{ en: 'Products, courses & resources', vi: 'Sản phẩm, khóa học & tài liệu' }} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'en' ? 'Search products...' : 'Tìm kiếm sản phẩm...'}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {PRODUCT_TYPES.map(t => (
                <Button
                  key={t.value}
                  size="sm"
                  variant={typeFilter === t.value ? 'default' : 'outline'}
                  onClick={() => setTypeFilter(t.value)}
                  className="gap-1.5"
                >
                  <t.icon size={14} />
                  {t.label[language]}
                </Button>
              ))}
            </div>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Nổi bật</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                <SelectItem value="price_desc">Giá giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category chips */}
          {categories && categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-8">
              <Badge
                variant={categoryFilter === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setCategoryFilter('')}
              >
                Tất cả
              </Badge>
              {categories.map(c => (
                <Badge
                  key={c.id}
                  variant={categoryFilter === c.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setCategoryFilter(c.id)}
                >
                  {c.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-0"><div className="aspect-square bg-muted" /><div className="p-4 space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div></CardContent></Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">{language === 'en' ? 'No products found' : 'Không tìm thấy sản phẩm'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => (
                <Link key={product.id} to={`/store/${product.slug}`} className="group">
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                    <div className="aspect-square overflow-hidden relative bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={48} className="text-muted-foreground/30" />
                        </div>
                      )}
                      {product.discount_percent && product.discount_percent > 0 && (
                        <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                          -{product.discount_percent}%
                        </Badge>
                      )}
                      <Badge className="absolute top-3 right-3" variant="secondary">
                        {typeLabels[product.product_type] || product.product_type}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      {product.brand && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
                      )}
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {product.discount_percent && product.discount_percent > 0 ? (
                          <>
                            <span className="font-bold text-primary">
                              {formatPrice(getDiscountedPrice(product.price, product.discount_percent))}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      {product.stock_quantity <= 0 && product.product_type === 'product' && (
                        <p className="text-xs text-destructive mt-1">Hết hàng</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <CustomSections page="store" />
      <Footer />
    </div>
  );
}
