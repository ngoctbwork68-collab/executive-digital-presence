import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, EyeOff, Package, BookOpen, FileText, Search } from 'lucide-react';
import {
  useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useProductCategories,
} from '@/hooks/useStore';
import { storeAPI, type Product } from '@/lib/supabase/store';
import { slugify } from '@/lib/slugify';

const TYPES = [
  { value: 'product', label: 'Vật phẩm', icon: Package },
  { value: 'course', label: 'Khóa học', icon: BookOpen },
  { value: 'ebook', label: 'Tài liệu/Ebook', icon: FileText },
];

const emptyProduct: Partial<Product> = {
  name: '', slug: '', description: '', full_description: '', price: 0, discount_percent: 0,
  stock_quantity: 0, image_url: '', images: [], colors: [], sizes: [], brand: '',
  category_id: null, product_type: 'product', featured: false, published: false, sort_order: 0,
  external_url: '', preview_url: '', instructor: '', duration: '', level: '', lessons_count: 0,
};

export default function StoreManager() {
  const { data: products, isLoading } = useAllProducts();
  const { data: categories } = useProductCategories();
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const filtered = products?.filter(p => {
    if (typeFilter && p.product_type !== typeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const openNew = () => {
    setEditing({ ...emptyProduct, sort_order: products?.length || 0 });
    setColorsInput('');
    setSizesInput('');
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setColorsInput(p.colors?.join(', ') || '');
    setSizesInput(p.sizes?.join(', ') || '');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.name) { toast.error('Cần nhập tên sản phẩm'); return; }
    const slug = editing.slug || slugify(editing.name);
    const colors = colorsInput ? colorsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const sizes = sizesInput ? sizesInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const data = { ...editing, slug, colors, sizes };
    try {
      if (data.id) {
        await updateMut.mutateAsync(data as Product);
        toast.success('Đã cập nhật');
      } else {
        await createMut.mutateAsync(data);
        toast.success('Đã tạo');
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await deleteMut.mutateAsync(id);
    toast.success('Đã xóa');
  };

  const addCategory = async () => {
    if (!newCategoryName) return;
    try {
      await storeAPI.createCategory({ name: newCategoryName, slug: slugify(newCategoryName) });
      setNewCategoryName('');
      toast.success('Đã thêm danh mục');
    } catch { toast.error('Lỗi thêm danh mục'); }
  };

  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Cửa hàng</h1>
          <p className="text-muted-foreground text-sm">Quản lý sản phẩm, khóa học, tài liệu</p>
        </div>
        <Button onClick={openNew}><Plus size={16} className="mr-1" /> Thêm sản phẩm</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={typeFilter === '' ? 'default' : 'outline'} onClick={() => setTypeFilter('')}>Tất cả ({products?.length || 0})</Button>
          {TYPES.map(t => {
            const count = products?.filter(p => p.product_type === t.value).length || 0;
            return (
              <Button key={t.value} size="sm" variant={typeFilter === t.value ? 'default' : 'outline'} onClick={() => setTypeFilter(t.value)} className="gap-1">
                <t.icon size={14} />{t.label} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có sản phẩm nào.</CardContent></Card>
        )}
        {filtered.map(p => (
          <Card key={p.id} className="group">
            <CardContent className="p-3 flex items-center gap-4">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center"><Package size={20} className="text-muted-foreground/40" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                  <Badge variant="outline" className="text-xs">{TYPES.find(t => t.value === p.product_type)?.label}</Badge>
                  {p.featured && <Badge variant="secondary" className="text-xs">Nổi bật</Badge>}
                  {!p.published && <Badge variant="destructive" className="text-xs">Ẩn</Badge>}
                </div>
                <p className="text-sm font-semibold text-primary">{formatPrice(p.price)}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => updateMut.mutateAsync({ id: p.id, published: !p.published } as any)}>
                  {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil size={16} /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Chỉnh sửa' : 'Thêm sản phẩm mới'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loại sản phẩm *</Label>
                  <Select value={editing.product_type} onValueChange={v => setEditing({ ...editing, product_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Danh mục</Label>
                  <Select value={editing.category_id || '_none'} onValueChange={v => setEditing({ ...editing, category_id: v === '_none' ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">-- Không --</SelectItem>
                      {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-2">
                    <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Danh mục mới" className="text-xs" />
                    <Button size="sm" variant="outline" onClick={addCategory}>+</Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Tên sản phẩm *</Label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Ví dụ: Khóa học SEO nâng cao" />
              </div>

              <div>
                <Label>Slug</Label>
                <Input value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
              </div>

              <div>
                <Label>Mô tả ngắn</Label>
                <Textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} placeholder="Mô tả hiển thị trên danh sách" />
              </div>

              <div>
                <Label>Hình ảnh chính</Label>
                <MediaUpload value={editing.image_url || ''} onChange={url => setEditing({ ...editing, image_url: url })} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Giá (VNĐ) *</Label>
                  <Input type="number" value={editing.price || 0} onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Giảm giá (%)</Label>
                  <Input type="number" value={editing.discount_percent || 0} onChange={e => setEditing({ ...editing, discount_percent: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Tồn kho</Label>
                  <Input type="number" value={editing.stock_quantity || 0} onChange={e => setEditing({ ...editing, stock_quantity: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div>
                <Label>Thương hiệu</Label>
                <Input value={editing.brand || ''} onChange={e => setEditing({ ...editing, brand: e.target.value })} placeholder="Tên thương hiệu (tùy chọn)" />
              </div>

              {(editing.product_type === 'product') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Màu sắc (phân cách bằng dấu phẩy)</Label>
                    <Input value={colorsInput} onChange={e => setColorsInput(e.target.value)} placeholder="Đỏ, Xanh, Đen" />
                  </div>
                  <div>
                    <Label>Kích thước (phân cách bằng dấu phẩy)</Label>
                    <Input value={sizesInput} onChange={e => setSizesInput(e.target.value)} placeholder="S, M, L, XL" />
                  </div>
                </div>
              )}

              {(editing.product_type === 'course' || editing.product_type === 'ebook') && (
                <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {editing.product_type === 'course' ? <BookOpen size={14} /> : <FileText size={14} />}
                    Thông tin {editing.product_type === 'course' ? 'khóa học' : 'tài liệu'}
                  </p>
                  <div>
                    <Label>Liên kết truy cập (external URL) *</Label>
                    <Input
                      value={editing.external_url || ''}
                      onChange={e => setEditing({ ...editing, external_url: e.target.value })}
                      placeholder="https://drive.google.com/... hoặc https://udemy.com/..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">Link Google Drive, Udemy, YouTube playlist, Notion, PDF... Người mua sẽ nhận sau khi thanh toán.</p>
                  </div>
                  <div>
                    <Label>Link preview / giới thiệu (tùy chọn)</Label>
                    <Input
                      value={editing.preview_url || ''}
                      onChange={e => setEditing({ ...editing, preview_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  {editing.product_type === 'course' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Giảng viên</Label>
                        <Input value={editing.instructor || ''} onChange={e => setEditing({ ...editing, instructor: e.target.value })} placeholder="Trần Bảo Ngọc" />
                      </div>
                      <div>
                        <Label>Thời lượng</Label>
                        <Input value={editing.duration || ''} onChange={e => setEditing({ ...editing, duration: e.target.value })} placeholder="8 giờ" />
                      </div>
                      <div>
                        <Label>Số bài học</Label>
                        <Input type="number" value={editing.lessons_count || 0} onChange={e => setEditing({ ...editing, lessons_count: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Cấp độ</Label>
                    <Select value={editing.level || '_none'} onValueChange={v => setEditing({ ...editing, level: v === '_none' ? '' : v })}>
                      <SelectTrigger><SelectValue placeholder="Chọn cấp độ" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">-- Không --</SelectItem>
                        <SelectItem value="Cơ bản">Cơ bản</SelectItem>
                        <SelectItem value="Trung cấp">Trung cấp</SelectItem>
                        <SelectItem value="Nâng cao">Nâng cao</SelectItem>
                        <SelectItem value="Chuyên gia">Chuyên gia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label>Mô tả chi tiết (Rich Text)</Label>
                <RichTextEditor content={editing.full_description || ''} onChange={c => setEditing({ ...editing, full_description: c })} />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={editing.published ?? false} onCheckedChange={v => setEditing({ ...editing, published: v })} />
                  <Label>Xuất bản</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.featured ?? false} onCheckedChange={v => setEditing({ ...editing, featured: v })} />
                  <Label>Nổi bật</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                  {editing.id ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
