import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, User, Briefcase, GraduationCap, FolderOpen, Activity,
  FileText, ShoppingBag, Ticket, Quote, MessageCircle, Blocks, Image as ImageIcon,
  Settings, LayoutDashboard, Search, ChevronRight, Lightbulb, AlertCircle,
  Workflow, HelpCircle, Rocket, ShieldCheck, Palette, Globe, Upload, Eye,
  Edit3, Save, Trash2, Plus, ArrowRight, CheckCircle2, Languages, Type,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────────────────
   Helper components
   ────────────────────────────────────────────────────────── */

const SectionTitle = ({ icon: Icon, title, subtitle, id }: any) => (
  <div id={id} className="scroll-mt-24 mb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center text-primary border border-primary/10">
        <Icon size={18} />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-muted-foreground ml-13 pl-0">{subtitle}</p>}
  </div>
);

const PageCard = ({ icon: Icon, title, path, purpose, fields, tips, color = 'primary' }: any) => (
  <Card className="p-5 hover:shadow-md transition-all border-border/60 bg-card">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
          color === 'primary' && 'bg-primary/10 text-primary border-primary/20',
          color === 'secondary' && 'bg-secondary/10 text-secondary border-secondary/20',
          color === 'accent' && 'bg-accent/10 text-accent-foreground border-accent/20',
        )}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-base text-foreground leading-tight">{title}</h3>
          <code className="text-[11px] text-muted-foreground font-mono">{path}</code>
        </div>
      </div>
      <Button asChild variant="ghost" size="sm" className="text-xs h-7">
        <Link to={path}>Mở <ArrowRight size={12} className="ml-1" /></Link>
      </Button>
    </div>

    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{purpose}</p>

    {fields && fields.length > 0 && (
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5">Trường dữ liệu chính</p>
        <div className="flex flex-wrap gap-1.5">
          {fields.map((f: string) => (
            <Badge key={f} variant="outline" className="text-[11px] font-normal">{f}</Badge>
          ))}
        </div>
      </div>
    )}

    {tips && (
      <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50">
        <div className="flex items-start gap-2">
          <Lightbulb size={14} className="text-secondary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">{tips}</p>
        </div>
      </div>
    )}
  </Card>
);

const Step = ({ number, title, children }: any) => (
  <div className="flex gap-4">
    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
      {number}
    </div>
    <div className="flex-1 pb-6 border-l-2 border-dashed border-border/50 pl-4 -ml-4">
      <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  </div>
);

const Workflow_ = ({ icon: Icon, title, description, steps }: any) => (
  <Card className="p-6 border-border/60">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="font-semibold text-base text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="space-y-0 mt-5">
      {steps.map((s: any, i: number) => (
        <Step key={i} number={i + 1} title={s.title}>
          {s.content}
        </Step>
      ))}
    </div>
  </Card>
);

const Faq = ({ q, children }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="font-medium text-sm text-foreground">{q}</span>
        <ChevronRight size={16} className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-90")} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed space-y-2 border-t border-border/50 pt-3">
          {children}
        </div>
      )}
    </div>
  );
};

const Kbd = ({ children }: any) => (
  <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded shadow-sm">{children}</kbd>
);

/* ──────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────── */

const PAGES = [
  {
    icon: LayoutDashboard, title: 'Dashboard', path: '/admin/dashboard', color: 'primary',
    purpose: 'Trang tổng quan: thống kê nhanh số lượng nội dung, lối tắt đến các tác vụ phổ biến.',
    fields: [],
    tips: 'Đây là trang đầu tiên sau khi đăng nhập. Dùng để nắm tình trạng website tổng thể.',
  },
  {
    icon: User, title: 'Hồ sơ (Profile)', path: '/admin/profile', color: 'primary',
    purpose: 'Cập nhật thông tin xuất hiện ở phần hero (đầu trang chủ): họ tên, chức danh, câu trích dẫn, ảnh đại diện và ảnh bìa.',
    fields: ['Họ tên', 'Chức danh', 'Câu trích dẫn', 'Ảnh đại diện', 'Ảnh bìa', 'Ẩn/hiện nút CTA'],
    tips: 'Ảnh bìa nên 1920×1080, JPG dưới 500KB để load nhanh. Câu trích dẫn dùng editor rich text — không cần dán mã HTML thủ công.',
  },
  {
    icon: Briefcase, title: 'Kinh nghiệm', path: '/admin/experiences', color: 'primary',
    purpose: 'Danh sách các công việc/kinh nghiệm hiển thị trên trang Experience và About. Hỗ trợ kéo-thả sắp xếp.',
    fields: ['Chức danh', 'Công ty', 'Năm', 'Địa điểm', 'Mô tả', 'Thành tựu'],
    tips: 'Mỗi thành tựu nên là 1 câu ngắn, đo lường được (số liệu, %, KPIs). Mô tả dùng rich text, tránh dán HTML thô.',
  },
  {
    icon: GraduationCap, title: 'Học vấn', path: '/admin/education', color: 'primary',
    purpose: 'Bằng cấp, trường học, chứng chỉ. Hiển thị ở trang About/Education.',
    fields: ['Trường', 'Bằng cấp', 'Ngành', 'Năm', 'Mô tả', 'Thành tựu'],
    tips: 'Sắp xếp từ mới nhất đến cũ nhất bằng cách kéo-thả.',
  },
  {
    icon: FolderOpen, title: 'Dự án', path: '/admin/projects', color: 'primary',
    purpose: 'Portfolio các dự án/case study. Có trang chi tiết riêng theo slug.',
    fields: ['Tiêu đề', 'Mô tả ngắn', 'Mô tả đầy đủ', 'Danh mục', 'Slug', 'Ảnh', 'Thách thức', 'Giải pháp', 'Metrics', 'Công nghệ'],
    tips: 'Slug tự sinh từ tiêu đề (loại bỏ dấu tiếng Việt). Đánh dấu "Featured" để dự án xuất hiện trên trang chủ.',
  },
  {
    icon: Activity, title: 'Hoạt động', path: '/admin/activities', color: 'primary',
    purpose: 'Hoạt động cộng đồng, sự kiện, vai trò lãnh đạo, hoạt động ngoại khóa.',
    fields: ['Tiêu đề', 'Mô tả', 'Danh mục', 'Ngày', 'Địa điểm', 'Ảnh', 'Liên kết'],
    tips: 'Bật "Published" thì mới hiển thị công khai. "Featured" để ưu tiên hiển thị.',
  },
  {
    icon: FileText, title: 'Blog', path: '/admin/blog', color: 'secondary',
    purpose: 'Viết & quản lý bài blog. Hỗ trợ rich text, ảnh, danh mục, slug SEO.',
    fields: ['Tiêu đề', 'Slug', 'Trích đoạn', 'Nội dung (rich text)', 'Ảnh bìa', 'Danh mục'],
    tips: 'Dán nội dung từ Word/Facebook → editor sẽ tự lọc HTML rác. Nhớ bật "Published" trước khi xuất bản.',
  },
  {
    icon: ShoppingBag, title: 'Cửa hàng', path: '/admin/store', color: 'secondary',
    purpose: 'Sản phẩm/khóa học bán trên trang Store. Tích hợp thanh toán VietQR.',
    fields: ['Tên', 'Mô tả', 'Giá', 'Ảnh', 'Danh mục', 'Loại', 'Tồn kho', 'Giảm giá', 'Sizes/Colors'],
    tips: 'Đặt giá chính xác — voucher % sẽ tính trên giá này. Nhiều ảnh: ảnh đầu là ảnh bìa.',
  },
  {
    icon: Ticket, title: 'Voucher', path: '/admin/vouchers', color: 'secondary',
    purpose: 'Mã giảm giá áp dụng khi đặt hàng. Hỗ trợ % hoặc số tiền cố định, giới hạn lượt dùng.',
    fields: ['Mã', 'Loại giảm', 'Giá trị', 'Đơn tối thiểu', 'Giới hạn lượt', 'Ngày hiệu lực'],
    tips: 'Mã viết IN HOA, không dấu, không khoảng trắng. Tắt "Active" để vô hiệu hóa thay vì xóa (giữ lịch sử).',
  },
  {
    icon: Quote, title: 'Testimonials', path: '/admin/testimonials', color: 'secondary',
    purpose: 'Lời chứng thực/nhận xét hiển thị trên trang chủ. Song ngữ EN/VN.',
    fields: ['Tên', 'Vai trò (EN/VN)', 'Trích dẫn (EN/VN)', 'Avatar'],
    tips: 'Có thể tắt toàn bộ phần Testimonials trên trang chủ ở mục Cài đặt.',
  },
  {
    icon: MessageCircle, title: 'Liên hệ', path: '/admin/contacts', color: 'accent',
    purpose: 'Hộp thư tin nhắn từ form liên hệ ở trang /contact. Có thể đánh dấu "đã xem" và xóa.',
    fields: ['Tên', 'Email', 'SĐT', 'Nội dung', 'Trạng thái'],
    tips: 'Mỗi tin nhắn chưa đọc có chấm đỏ. Click vào tin để xem chi tiết và phản hồi qua email.',
  },
  {
    icon: Blocks, title: 'Custom Sections', path: '/admin/custom-sections', color: 'accent',
    purpose: 'Chèn block nội dung tự do (rich text + ảnh) vào bất kỳ trang công khai nào.',
    fields: ['Tiêu đề', 'Phụ đề', 'Nội dung', 'Trang đích', 'Style nền', 'Sort order'],
    tips: 'Hữu ích khi muốn thêm 1 đoạn giới thiệu, banner, CTA mà không cần lập trình. Chọn đúng "Page" để section xuất hiện.',
  },
  {
    icon: ImageIcon, title: 'Thư viện Media', path: '/admin/media', color: 'accent',
    purpose: 'Trung tâm quản lý ảnh/file đã upload. Tái sử dụng cho mọi nội dung qua MediaPicker.',
    fields: ['Filename', 'Loại file', 'Alt text (EN/VN)', 'Kích thước'],
    tips: 'Đặt alt text tốt cho SEO và accessibility. Xóa file không dùng để tiết kiệm dung lượng.',
  },
  {
    icon: Settings, title: 'Cài đặt', path: '/admin/settings', color: 'accent',
    purpose: 'Cấu hình toàn cục: logo, favicon, tên site, theme màu, font, layout header/footer, ngân hàng VietQR, tiêu đề các trang.',
    fields: ['Logo', 'Favicon', 'Site name', 'Theme màu', 'Font', 'Header/Footer style', 'Bank info', 'Page heroes'],
    tips: 'Đổi theme màu áp dụng ngay realtime. Page heroes cho phép tùy biến tiêu đề và ảnh nền cho từng trang con.',
  },
  {
    icon: Sparkles, title: 'Trang Loading', path: '/admin/loading-screen', color: 'primary',
    purpose: 'Tùy biến màn hình chờ hiển thị khi trang đang tải dữ liệu: ảnh nền, logo, tiêu đề, hiệu ứng và màu nhấn.',
    fields: ['Ảnh nền', 'Logo', 'Tiêu đề', 'Phụ đề', 'Hiệu ứng (Ring/Dots/Wave/Pulse)', 'Overlay', 'Màu nhấn'],
    tips: 'Chọn ảnh nền tối màu hoặc tăng overlay để chữ nổi rõ. Preview trực tiếp bên phải giúp căn chỉnh nhanh trước khi lưu.',
  },
];

const WORKFLOWS = [
  {
    icon: Rocket, title: 'Lần đầu thiết lập website',
    description: 'Các bước tối thiểu để website "lên sóng" với nội dung của bạn.',
    steps: [
      { title: 'Cập nhật hồ sơ', content: <>Vào <Link to="/admin/profile" className="text-primary underline">Hồ sơ</Link> → nhập họ tên, chức danh, câu trích dẫn, upload ảnh đại diện và ảnh bìa cho hero.</> },
      { title: 'Cài đặt thương hiệu', content: <>Vào <Link to="/admin/settings" className="text-primary underline">Cài đặt</Link> → upload Logo, Favicon, đặt tên site, chọn theme màu và font phù hợp.</> },
      { title: 'Thêm kinh nghiệm & học vấn', content: <>Vào <Link to="/admin/experiences" className="text-primary underline">Kinh nghiệm</Link> và <Link to="/admin/education" className="text-primary underline">Học vấn</Link>, thêm các mốc quan trọng. Kéo-thả để sắp xếp.</> },
      { title: 'Thêm 2-3 dự án nổi bật', content: <>Vào <Link to="/admin/projects" className="text-primary underline">Dự án</Link>, đánh dấu "Featured" để chúng xuất hiện trên trang chủ.</> },
      { title: 'Viết bài blog đầu tiên', content: <>Vào <Link to="/admin/blog" className="text-primary underline">Blog</Link>, tạo bài, bật "Published".</> },
      { title: 'Kiểm tra và publish', content: <>Mở trang chủ ở tab mới, kiểm tra trên cả desktop và mobile. Khi ổn, publish website.</> },
    ],
  },
  {
    icon: Edit3, title: 'Đăng bài blog mới',
    description: 'Quy trình chuẩn để đăng một bài viết.',
    steps: [
      { title: 'Mở Blog Manager', content: <>Vào <Link to="/admin/blog" className="text-primary underline">/admin/blog</Link>, click <Kbd>+ Tạo mới</Kbd>.</> },
      { title: 'Nhập tiêu đề & slug', content: 'Slug tự động sinh từ tiêu đề (đã loại bỏ dấu tiếng Việt). Có thể chỉnh tay nếu cần.' },
      { title: 'Viết nội dung', content: 'Dùng editor rich text. Có thể dán từ Word/Google Docs — hệ thống tự lọc HTML rác. Chèn ảnh từ thư viện hoặc upload mới.' },
      { title: 'Chọn danh mục & ảnh bìa', content: 'Ảnh bìa hiển thị ở trang danh sách blog và share social.' },
      { title: 'Bật Published & Lưu', content: <>Toggle <Kbd>Published</Kbd> sang ON rồi <Kbd>Save</Kbd>. Bài viết xuất hiện ngay tại <Link to="/blog" className="text-primary underline">/blog</Link>.</> },
    ],
  },
  {
    icon: ShoppingBag, title: 'Thêm sản phẩm vào cửa hàng',
    description: 'Đăng sản phẩm/khóa học để bán qua VietQR.',
    steps: [
      { title: 'Cấu hình ngân hàng', content: <>Lần đầu: vào <Link to="/admin/settings" className="text-primary underline">Cài đặt</Link> → mục Banking, chọn ngân hàng, nhập số TK & tên chủ TK.</> },
      { title: 'Tạo sản phẩm', content: <>Vào <Link to="/admin/store" className="text-primary underline">Cửa hàng</Link>, click thêm mới. Nhập tên, mô tả, giá, upload ảnh.</> },
      { title: 'Cấu hình giá & tồn kho', content: 'Đặt giá gốc và % giảm (nếu có). Đặt số lượng tồn kho — hết hàng sẽ tự khóa nút mua.' },
      { title: 'Tạo voucher (tùy chọn)', content: <>Vào <Link to="/admin/vouchers" className="text-primary underline">Voucher</Link>, tạo mã giảm giá kèm điều kiện.</> },
      { title: 'Theo dõi đơn hàng', content: 'Đơn hàng mới sẽ về dashboard. Cập nhật trạng thái khi xử lý.' },
    ],
  },
  {
    icon: Palette, title: 'Đổi diện mạo website',
    description: 'Thay đổi màu, font, layout mà không cần code.',
    steps: [
      { title: 'Vào Cài đặt', content: <><Link to="/admin/settings" className="text-primary underline">/admin/settings</Link> → tab "Giao diện".</> },
      { title: 'Chọn theme màu', content: 'Có 16 palette dựng sẵn. Click để xem preview ngay. Hoặc tùy chỉnh màu HSL thủ công.' },
      { title: 'Chọn font', content: '15 cặp Google Font đã pair sẵn. Áp dụng ngay không cần reload.' },
      { title: 'Cấu hình layout', content: 'Header style: Default / Centered / Minimal. Footer tương tự. Chọn tùy mood thương hiệu.' },
      { title: 'Lưu', content: 'Mọi thay đổi áp dụng toàn site ngay lập tức.' },
    ],
  },
  {
    icon: Globe, title: 'Tùy biến trang con (About, Projects, Blog…)',
    description: 'Đổi tiêu đề, ảnh nền cho từng trang công khai.',
    steps: [
      { title: 'Vào Cài đặt → Page Heroes', content: 'Mỗi trang có 1 thẻ riêng để chỉnh.' },
      { title: 'Nhập tiêu đề EN/VN', content: 'Song ngữ. Tiêu đề chính + phụ đề + label nhỏ phía trên.' },
      { title: 'Upload ảnh nền (tùy chọn)', content: 'Nếu không upload thì dùng gradient mặc định.' },
      { title: 'Bật/tắt hiển thị', content: 'Có thể ẩn hoàn toàn hero của một trang nếu muốn.' },
    ],
  },
  {
    icon: Blocks, title: 'Chèn block nội dung vào trang bất kỳ',
    description: 'Dùng Custom Sections để thêm nội dung mà không cần code.',
    steps: [
      { title: 'Vào Custom Sections', content: <><Link to="/admin/custom-sections" className="text-primary underline">/admin/custom-sections</Link>, click tạo mới.</> },
      { title: 'Chọn trang đích', content: 'home / about / projects / blog / contact / store…' },
      { title: 'Soạn nội dung', content: 'Tiêu đề + phụ đề + ảnh + nội dung rich text.' },
      { title: 'Chọn style nền', content: 'Default / Muted / Accent / Dark — tùy nội dung.' },
      { title: 'Bật Published & sắp xếp', content: 'Sort order quyết định thứ tự hiển thị nếu có nhiều section trên cùng 1 trang.' },
    ],
  },
];

const FAQS = [
  {
    q: 'Tại sao nội dung tôi vừa lưu chưa hiện trên website?',
    a: <>Phần lớn dữ liệu cập nhật ngay lập tức. Nếu chưa thấy: (1) bạn quên bật <Kbd>Published</Kbd>; (2) trình duyệt cache — bấm <Kbd>Ctrl/Cmd</Kbd> + <Kbd>Shift</Kbd> + <Kbd>R</Kbd> để hard reload; (3) kiểm tra đúng trang đích.</>,
  },
  {
    q: 'Ảnh bìa upload xong không hiển thị?',
    a: 'Kiểm tra: file phải là JPG/PNG/WebP, dưới 10MB. Nếu vẫn lỗi, vào Thư viện Media xem file đã tồn tại chưa. Đôi khi cần đợi 1-2 giây sau upload rồi save.',
  },
  {
    q: 'Slug là gì? Có cần chỉnh không?',
    a: 'Slug là phần URL của bài viết/dự án (ví dụ: /blog/cach-quan-ly-thoi-gian). Hệ thống tự sinh từ tiêu đề, đã loại bỏ dấu tiếng Việt. Bạn chỉ cần chỉnh khi muốn URL ngắn gọn hoặc khác tiêu đề.',
  },
  {
    q: 'Làm sao để website hỗ trợ song ngữ EN/VN?',
    a: 'Người dùng chuyển ngôn ngữ ở góc trên cùng (VN/EN). Một số nội dung như Testimonials, Page Heroes đã có form song ngữ. Các nội dung khác sẽ hiển thị giống nhau cho cả 2 ngôn ngữ.',
  },
  {
    q: 'Tôi dán nội dung từ Word/Facebook nhưng có nhiều ký tự lạ?',
    a: 'Editor đã tự lọc HTML rác (như <p>, ![alt]…) khi render. Nếu vẫn còn, dùng nút "Clear formatting" trên thanh toolbar editor, hoặc paste vào Notepad rồi copy lại để loại format.',
  },
  {
    q: 'Làm sao xóa hẳn 1 bài viết / dự án?',
    a: 'Mở danh sách → click icon thùng rác → xác nhận. Hành động này KHÔNG hoàn tác được. Để tạm ẩn thay vì xóa, hãy tắt "Published".',
  },
  {
    q: 'Đổi mật khẩu admin ở đâu?',
    a: <>Đăng xuất → vào <Link to="/admin" className="text-primary underline">/admin</Link> → click "Quên mật khẩu" → nhập email → làm theo hướng dẫn trong email.</>,
  },
  {
    q: 'Tôi có thể giao quyền admin cho người khác không?',
    a: 'Có. Cần thêm user_id của họ vào bảng user_roles với role = admin (làm qua Supabase dashboard). Liên hệ kỹ thuật để hỗ trợ nếu cần.',
  },
  {
    q: 'Chatbot AI hoạt động như thế nào?',
    a: 'Chatbot đọc dữ liệu từ Hồ sơ + Kinh nghiệm + Học vấn để trả lời khách. Càng cập nhật đầy đủ thông tin, chatbot càng trả lời chính xác.',
  },
  {
    q: 'Hình ảnh nên có kích thước bao nhiêu?',
    a: 'Ảnh bìa hero: 1920×1080. Ảnh dự án/blog: 16:9, ~1600×900. Ảnh đại diện: vuông, ≥800×800. Avatar testimonial: vuông, ~400×400. Nén dưới 500KB để load nhanh.',
  },
];

const TIPS = [
  { icon: Save, title: 'Lưu thường xuyên', desc: 'Editor không tự lưu draft. Bấm Save sau mỗi thay đổi quan trọng.' },
  { icon: Eye, title: 'Preview trước khi publish', desc: 'Mở trang công khai ở tab khác, kiểm tra cả desktop và mobile.' },
  { icon: Languages, title: 'Tận dụng song ngữ', desc: 'Nội dung EN giúp tiếp cận khách quốc tế và cải thiện SEO.' },
  { icon: Type, title: 'Tiêu đề SEO', desc: 'Tiêu đề blog/dự án nên 50-60 ký tự, chứa từ khóa quan trọng đầu câu.' },
  { icon: Upload, title: 'Tái sử dụng ảnh', desc: 'Upload 1 lần vào Thư viện Media, dùng lại nhiều nơi qua Media Picker.' },
  { icon: ShieldCheck, title: 'Backup định kỳ', desc: 'Xuất dữ liệu quan trọng (blog, dự án) định kỳ qua Supabase dashboard.' },
];

/* ──────────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────────── */

const NAV = [
  { id: 'overview', label: 'Tổng quan', icon: BookOpen },
  { id: 'pages', label: 'Các trang Admin', icon: LayoutDashboard },
  { id: 'workflows', label: 'Workflow phổ biến', icon: Workflow },
  { id: 'tips', label: 'Mẹo sử dụng', icon: Lightbulb },
  { id: 'faq', label: 'Câu hỏi thường gặp', icon: HelpCircle },
];

export default function Guide() {
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const filteredPages = PAGES.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.purpose.toLowerCase().includes(q) || p.path.includes(q);
  });

  const filteredFaqs = FAQS.filter((f) => {
    if (!search) return true;
    return f.q.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-8 md:p-12 text-primary-foreground shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-4">
            <Sparkles size={12} /> Hướng dẫn sử dụng
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-3 leading-tight">
            Mọi thứ bạn cần để vận hành website
          </h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mb-6">
            Tổng quan từng trang admin, các workflow phổ biến, mẹo dùng và câu hỏi thường gặp — tất cả ở một nơi.
          </p>
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/60" />
            <Input
              placeholder="Tìm kiếm trang, tính năng, câu hỏi…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60 backdrop-blur"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Side nav */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-2">Mục lục</p>
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeId === n.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <n.icon size={14} />
                {n.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-12 min-w-0">
          {/* Overview */}
          <section>
            <SectionTitle id="overview" icon={BookOpen} title="Tổng quan" subtitle="Hệ thống admin được thiết kế để bạn vận hành website mà không cần biết code." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: User, label: 'Quản lý nội dung', desc: 'Hồ sơ, kinh nghiệm, học vấn, dự án, hoạt động' },
                { icon: FileText, label: 'Xuất bản', desc: 'Blog, sản phẩm, voucher, testimonials' },
                { icon: Settings, label: 'Tùy biến hệ thống', desc: 'Theme, font, layout, hero các trang, banking' },
              ].map((b, i) => (
                <Card key={i} className="p-4 border-border/60">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <b.icon size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-1">{b.label}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-5 mt-4 border-secondary/20 bg-secondary/5">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Quy ước chung</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Mọi nội dung có cờ <Kbd>Published</Kbd> — phải bật để hiển thị công khai.</li>
                    <li>Nội dung sắp xếp được bằng kéo-thả (icon ☰ ở mỗi dòng).</li>
                    <li>Form rich text tự lọc HTML rác khi paste từ Word/Facebook.</li>
                    <li>Thay đổi áp dụng ngay lập tức — không cần deploy lại.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Pages */}
          <section>
            <SectionTitle id="pages" icon={LayoutDashboard} title="Các trang Admin" subtitle={`${filteredPages.length} trang • Click "Mở" để đi nhanh đến trang đó`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPages.map((p) => <PageCard key={p.path} {...p} />)}
              {filteredPages.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground col-span-full">
                  Không tìm thấy trang nào khớp với "{search}".
                </Card>
              )}
            </div>
          </section>

          {/* Workflows */}
          <section>
            <SectionTitle id="workflows" icon={Workflow} title="Workflow phổ biến" subtitle="Các kịch bản theo mục tiêu — làm theo từng bước." />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {WORKFLOWS.map((w, i) => <Workflow_ key={i} {...w} />)}
            </div>
          </section>

          {/* Tips */}
          <section>
            <SectionTitle id="tips" icon={Lightbulb} title="Mẹo sử dụng" subtitle="Best practices để website đẹp, nhanh và chuẩn SEO." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TIPS.map((t, i) => (
                <Card key={i} className="p-4 border-border/60 hover:border-secondary/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <t.icon size={14} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1.5">
                        {t.title}
                        <CheckCircle2 size={12} className="text-secondary" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <SectionTitle id="faq" icon={HelpCircle} title="Câu hỏi thường gặp" subtitle="Click vào câu hỏi để xem câu trả lời." />
            <div className="space-y-2">
              {filteredFaqs.map((f, i) => (
                <Faq key={i} q={f.q}>{f.a}</Faq>
              ))}
              {filteredFaqs.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  Không có câu hỏi nào khớp với "{search}".
                </Card>
              )}
            </div>
          </section>

          {/* Footer */}
          <Card className="p-6 bg-gradient-to-br from-muted/40 to-muted/10 border-border/60 text-center">
            <Sparkles className="mx-auto text-secondary mb-2" size={20} />
            <h3 className="font-serif text-xl font-bold mb-1">Cần thêm hỗ trợ?</h3>
            <p className="text-sm text-muted-foreground mb-4">Chatbot AI ở góc phải màn hình có thể trả lời nhanh nhiều câu hỏi.</p>
            <Button asChild variant="outline">
              <Link to="/admin/dashboard">Quay lại Dashboard</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
