import { useState } from 'react';
import SmartImage from '@/components/SmartImage';
import { useParams, Link } from 'react-router-dom';
import { useProductBySlug } from '@/hooks/useStore';
import { useLanguage } from '@/lib/i18n';
import { useSettings } from '@/hooks/useSettings';
import { getBankByCode } from '@/lib/vietqrBanks';
import { vouchersAPI, validateVoucher, calculateDiscount, Voucher } from '@/lib/supabase/vouchers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ShoppingBag, Package, BookOpen, FileText, QrCode, Copy, Check, Minus, Plus, CheckCircle2, Smartphone, CreditCard, Ticket, X, PlayCircle, ExternalLink, Clock, GraduationCap, BarChart3, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichContent from '@/components/RichContent';
import { toast } from 'sonner';

export default function StoreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || '');
  const { data: allSettings } = useSettings();
  const { language } = useLanguage();

  // Bank settings from admin
  const settingsMap = allSettings?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>) || {};
  const bankCode = settingsMap.bank_code || '970422';
  const bankAccount = settingsMap.bank_account || '0123456789';
  const bankOwner = settingsMap.bank_owner || '';
  const bank = getBankByCode(bankCode);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Đang tải...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
          <Button asChild><Link to="/store"><ArrowLeft size={16} className="mr-1" />Quay lại</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatPriceRaw = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price);

  const discountedPrice = product.discount_percent
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const subtotal = discountedPrice * quantity;
  const voucherDiscountAmount = appliedVoucher ? calculateDiscount(appliedVoucher, subtotal) : 0;
  const totalPrice = subtotal - voucherDiscountAmount;
  const transferContent = `${product.name.slice(0, 30)} x${quantity}`;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const voucher = await vouchersAPI.getByCode(voucherCode);
      const result = validateVoucher(voucher, subtotal, product.product_type);
      if (!result.valid) {
        toast.error(result.error);
      } else {
        setAppliedVoucher(voucher);
        toast.success(`Áp dụng mã "${voucher.code}" thành công!`);
      }
    } catch {
      toast.error('Mã không hợp lệ hoặc không tồn tại');
    }
    setVoucherLoading(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];

  const typeIcons: Record<string, any> = { product: Package, course: BookOpen, ebook: FileText };
  const typeLabels: Record<string, string> = { product: 'Vật phẩm', course: 'Khóa học', ebook: 'Tài liệu' };
  const TypeIcon = typeIcons[product.product_type] || Package;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Đã sao chép!');
  };

  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.jpg?amount=${Math.round(totalPrice)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankOwner)}`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/store"><ArrowLeft size={16} className="mr-1" />{language === 'en' ? 'Back to Store' : 'Quay lại cửa hàng'}</Link>
        </Button>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
              {allImages.length > 0 ? (
                <SmartImage src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={64} className="text-muted-foreground/30" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <SmartImage src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="gap-1">
                  <TypeIcon size={12} />
                  {typeLabels[product.product_type]}
                </Badge>
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
              </div>
              <h1 className="font-serif text-3xl font-bold mb-3">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Course / Ebook meta */}
              {(product.product_type === 'course' || product.product_type === 'ebook') && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {product.instructor && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User size={14} className="text-primary" /> {product.instructor}
                    </div>
                  )}
                  {product.duration && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock size={14} className="text-primary" /> {product.duration}
                    </div>
                  )}
                  {product.lessons_count ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <GraduationCap size={14} className="text-primary" /> {product.lessons_count} bài học
                    </div>
                  ) : null}
                  {product.level && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <BarChart3 size={14} className="text-primary" /> {product.level}
                    </div>
                  )}
                </div>
              )}

              {product.preview_url && (
                <a
                  href={product.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:underline"
                >
                  <PlayCircle size={16} /> Xem preview / giới thiệu
                </a>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(discountedPrice)}</span>
              {product.discount_percent && product.discount_percent > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <Badge className="bg-destructive text-destructive-foreground">-{product.discount_percent}%</Badge>
                </>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Màu sắc</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedColor === c ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Kích thước</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                        selectedSize === s ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity - only for physical products */}
            {product.product_type === 'product' && (
              <div>
                <p className="text-sm font-medium mb-2">Số lượng</p>
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></Button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <Button size="icon" variant="outline" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></Button>
                </div>
              </div>
            )}

            {/* Voucher */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1"><Ticket size={14} /> Mã giảm giá</p>
              {appliedVoucher ? (
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Ticket size={16} className="text-primary" />
                  <div className="flex-1">
                    <span className="font-mono font-bold text-primary">{appliedVoucher.code}</span>
                    <span className="text-sm text-muted-foreground ml-2">-{formatPrice(voucherDiscountAmount)}</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={handleRemoveVoucher}><X size={14} /></Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã giảm giá..."
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    className="font-mono"
                    onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                  />
                  <Button variant="outline" onClick={handleApplyVoucher} disabled={voucherLoading}>
                    {voucherLoading ? '...' : 'Áp dụng'}
                  </Button>
                </div>
              )}
            </div>

            {/* Total + Buy */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="text-muted-foreground">{formatPrice(subtotal)}</span>
                  </div>
                )}
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-primary flex items-center gap-1"><Ticket size={12} /> Voucher:</span>
                    <span className="text-primary">-{formatPrice(voucherDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setShowPayment(true)}
                  disabled={product.product_type === 'product' && product.stock_quantity <= 0}
                >
                  <QrCode size={18} className="mr-2" />
                  {product.stock_quantity <= 0 && product.product_type === 'product' ? 'Hết hàng' : 'Thanh toán QR'}
                </Button>
              </CardContent>
            </Card>

            {product.stock_quantity > 0 && product.product_type === 'product' && (
              <p className="text-sm text-muted-foreground">Còn {product.stock_quantity} sản phẩm</p>
            )}
          </div>
        </div>

        {/* Full description */}
        {product.full_description && (
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="font-serif text-2xl font-bold mb-6">Chi tiết sản phẩm</h2>
            <RichContent html={product.full_description} className="prose prose-lg max-w-none dark:prose-invert" />
          </div>
        )}
      </div>

      {/* Payment Dialog - Super Professional */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 mb-2">
              <CreditCard size={22} /> Thanh toán chuyển khoản
            </DialogTitle>
            <p className="text-sm opacity-90">Quét mã QR hoặc chuyển khoản thủ công</p>
          </div>

          <div className="p-6 space-y-5">
            {/* QR Code Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="bg-white p-3 rounded-2xl shadow-lg border">
                <img
                  src={qrUrl}
                  alt="VietQR Payment"
                  className="w-44 h-44 object-contain"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                {bank && (
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                    <SmartImage src={bank.logo} alt={bank.shortName} className="w-10 h-10 object-contain" />
                    <div>
                      <p className="font-bold text-sm">{bank.name}</p>
                      <p className="text-xs text-muted-foreground">{bank.shortName}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Số tiền thanh toán</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Smartphone size={12} /> Hướng dẫn thanh toán
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                  <span>Mở App Ngân hàng hoặc Ví điện tử (MoMo, ZaloPay...)</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                  <span>Quét mã QR hoặc nhập thông tin tài khoản bên dưới</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
                  <span>Kiểm tra thông tin và xác nhận chuyển khoản</span>
                </div>
              </div>
            </div>

            {/* Bank Details - Copy each field */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thông tin chuyển khoản</p>
              
              {/* Account Number */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors">
                <div>
                  <p className="text-xs text-muted-foreground">Số tài khoản</p>
                  <p className="font-mono font-bold">{bankAccount}</p>
                </div>
                <Button 
                  size="sm" 
                  variant={copiedField === 'account' ? 'default' : 'outline'} 
                  onClick={() => copyToClipboard(bankAccount, 'account')}
                  className="gap-1.5"
                >
                  {copiedField === 'account' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedField === 'account' ? 'Đã sao chép' : 'Sao chép'}
                </Button>
              </div>

              {/* Account Name */}
              {bankOwner && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors">
                  <div>
                    <p className="text-xs text-muted-foreground">Chủ tài khoản</p>
                    <p className="font-bold">{bankOwner}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={copiedField === 'owner' ? 'default' : 'outline'} 
                    onClick={() => copyToClipboard(bankOwner, 'owner')}
                    className="gap-1.5"
                  >
                    {copiedField === 'owner' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedField === 'owner' ? 'Đã sao chép' : 'Sao chép'}
                  </Button>
                </div>
              )}

              {/* Amount */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors">
                <div>
                  <p className="text-xs text-muted-foreground">Số tiền</p>
                  <p className="font-bold text-primary">{formatPriceRaw(Math.round(totalPrice))} VNĐ</p>
                </div>
                <Button 
                  size="sm" 
                  variant={copiedField === 'amount' ? 'default' : 'outline'} 
                  onClick={() => copyToClipboard(Math.round(totalPrice).toString(), 'amount')}
                  className="gap-1.5"
                >
                  {copiedField === 'amount' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedField === 'amount' ? 'Đã sao chép' : 'Sao chép'}
                </Button>
              </div>

              {/* Transfer Content */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-xs text-muted-foreground">Nội dung chuyển khoản</p>
                  <p className="font-medium text-sm truncate">{transferContent}</p>
                </div>
                <Button 
                  size="sm" 
                  variant={copiedField === 'content' ? 'default' : 'outline'} 
                  onClick={() => copyToClipboard(transferContent, 'content')}
                  className="gap-1.5 flex-shrink-0"
                >
                  {copiedField === 'content' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedField === 'content' ? 'Đã sao chép' : 'Sao chép'}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-3">
                {product.image_url && <SmartImage src={product.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Số lượng: {quantity}</p>
                </div>
                <p className="font-bold text-primary">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            {/* Footer note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-secondary" />
              <span>Sau khi chuyển khoản thành công, đơn hàng sẽ được xử lý trong vòng 24h. Liên hệ hotline nếu cần hỗ trợ.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
