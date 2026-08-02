import { useNavigate } from 'react-router-dom';
import { useAllPosts } from '@/hooks/useBlog';
import { usePublishedExperiences } from '@/hooks/useExperiences';
import { useAllProjects } from '@/hooks/useProjects';
import { useAllMedia } from '@/hooks/useMedia';
import {
  User, Briefcase, FolderOpen, Activity, FileText,
  Image, Settings, BookOpen, Award, Layers, ShoppingBag, Blocks,
  GraduationCap, Ticket, Quote, ArrowUpRight, Sparkles, MessageCircle, Palette
} from 'lucide-react';

const SECTION_GROUPS = [
  {
    title: 'Nội dung chính',
    desc: 'Quản lý hồ sơ, kinh nghiệm và dự án',
    items: [
      { path: '/admin/profile', icon: User, label: 'Hồ sơ', desc: 'Thông tin cá nhân', color: 'from-blue-500 to-indigo-600' },
      { path: '/admin/experiences', icon: Briefcase, label: 'Kinh nghiệm', desc: 'Kinh nghiệm làm việc', color: 'from-emerald-500 to-teal-600' },
      { path: '/admin/education', icon: GraduationCap, label: 'Học vấn', desc: 'Bằng cấp & chứng chỉ', color: 'from-sky-500 to-blue-600' },
      { path: '/admin/projects', icon: FolderOpen, label: 'Dự án', desc: 'Portfolio & case studies', color: 'from-violet-500 to-purple-600' },
      { path: '/admin/activities', icon: Activity, label: 'Hoạt động', desc: 'Hoạt động & lãnh đạo', color: 'from-orange-500 to-amber-600' },
    ],
  },
  {
    title: 'Xuất bản & Bán hàng',
    desc: 'Blog, cửa hàng và voucher',
    items: [
      { path: '/admin/blog', icon: FileText, label: 'Blog', desc: 'Viết & xuất bản bài viết', color: 'from-rose-500 to-pink-600' },
      { path: '/admin/store', icon: ShoppingBag, label: 'Cửa hàng', desc: 'Sản phẩm & khóa học', color: 'from-amber-500 to-yellow-600' },
      { path: '/admin/vouchers', icon: Ticket, label: 'Voucher', desc: 'Mã giảm giá', color: 'from-lime-500 to-green-600' },
    ],
  },
  {
    title: 'Tuỳ chỉnh & Hệ thống',
    desc: 'Giao diện, thư viện ảnh và cài đặt',
    items: [
      { path: '/admin/testimonials', icon: Quote, label: 'Testimonials', desc: 'Lời nhận xét khách hàng', color: 'from-fuchsia-500 to-pink-600' },
      { path: '/admin/contacts', icon: MessageCircle, label: 'Liên hệ', desc: 'Tin nhắn & thông tin liên hệ', color: 'from-indigo-500 to-blue-600' },
      { path: '/admin/custom-sections', icon: Blocks, label: 'Custom Sections', desc: 'Section tùy chỉnh', color: 'from-teal-500 to-cyan-600' },
      { path: '/admin/media', icon: Image, label: 'Thư viện', desc: 'Hình ảnh & tệp tin', color: 'from-cyan-500 to-blue-600' },
      { path: '/admin/design', icon: Palette, label: 'Bộ giao diện', desc: 'Chọn layout tổng thể', color: 'from-amber-500 to-orange-600' },
      { path: '/admin/settings', icon: Settings, label: 'Cài đặt', desc: 'Logo, theme & hiển thị', color: 'from-slate-500 to-gray-600' },
    ],
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: posts } = useAllPosts();
  const { data: experiences } = usePublishedExperiences();
  const { data: projects } = useAllProjects();
  const { data: media } = useAllMedia();

  const stats = [
    { label: 'Bài viết', value: posts?.length || 0, icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-500/10', ring: 'ring-rose-500/20' },
    { label: 'Kinh nghiệm', value: experiences?.length || 0, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
    { label: 'Dự án', value: projects?.length || 0, icon: Layers, color: 'text-violet-500', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20' },
    { label: 'Media', value: media?.length || 0, icon: Image, color: 'text-cyan-500', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/20' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shrink-0">
          <Sparkles size={22} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Quản lý toàn bộ nội dung portfolio của bạn</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ring-1 ${stat.ring} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Groups */}
      {SECTION_GROUPS.map((group, gi) => (
        <div key={gi} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{group.title}</h2>
            <p className="text-sm text-muted-foreground">{group.desc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.items.map((item, i) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${(gi * 5 + i) * 40}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" style={{}} />
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all`}>
                    <item.icon size={20} className="text-white" />
                  </div>
                  <ArrowUpRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="font-semibold text-foreground mb-0.5">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
