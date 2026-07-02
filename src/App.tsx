import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import BackToTop from "./components/BackToTop";
import ChatbotWidget from "./components/ChatbotWidget";
import FaviconUpdater from "./components/FaviconUpdater";
import ColorThemeApplier from "./components/ColorThemeApplier";
import FontThemeApplier from "./components/FontThemeApplier";
import ScrollToTop from "./components/ScrollToTop";

// Eager-load home for fast first paint
import Home from "./pages/Home";

// Lazy-load every other route to slash bundle size & speed up navigation
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Store = lazy(() => import("./pages/Store"));
const StoreDetail = lazy(() => import("./pages/StoreDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProfileManager = lazy(() => import("./pages/admin/ProfileManager"));
const ProjectsManager = lazy(() => import("./pages/admin/ProjectsManager"));
const SettingsManager = lazy(() => import("./pages/admin/SettingsManager"));
const ActivitiesManager = lazy(() => import("./pages/admin/ActivitiesManager"));
const ExperiencesManager = lazy(() => import("./pages/admin/ExperiencesManager"));
const EducationManager = lazy(() => import("./pages/admin/EducationManager"));
const BlogManager = lazy(() => import("./pages/admin/BlogManager"));
const MediaLibrary = lazy(() => import("./pages/admin/MediaLibrary"));
const CustomSectionsManager = lazy(() => import("./pages/admin/CustomSectionsManager"));
const StoreManager = lazy(() => import("./pages/admin/StoreManager"));
const VouchersManager = lazy(() => import("./pages/admin/VouchersManager"));
const TestimonialsManager = lazy(() => import("./pages/admin/TestimonialsManager"));
const ContactManager = lazy(() => import("./pages/admin/ContactManager"));
const Guide = lazy(() => import("./pages/admin/Guide"));
const BrandingManager = lazy(() => import("./pages/admin/BrandingManager"));
const OrdersManager = lazy(() => import("./pages/admin/OrdersManager"));
const CategoriesManager = lazy(() => import("./pages/admin/CategoriesManager"));
const ChatbotManager = lazy(() => import("./pages/admin/ChatbotManager"));
const SectionsOrderManager = lazy(() => import("./pages/admin/SectionsOrderManager"));
const BookingsManager = lazy(() => import("./pages/admin/BookingsManager"));
const LoadingScreenManager = lazy(() => import("./pages/admin/LoadingScreenManager"));

// Stale-While-Revalidate:
// - Dữ liệu local từ localStorage persister được hiển thị TỨC THÌ.
// - Mọi query luôn refetch ngầm ở nền khi component mount/route đổi.
// - React Query structuralSharing giữ nguyên reference nếu data không đổi
//   → component KHÔNG re-render, chỉ thay đổi khi server trả phiên bản mới.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                  // luôn coi là stale → revalidate ngầm
      gcTime: 24 * 60 * 60 * 1000,   // giữ 24h để persist hữu ích
      refetchOnMount: "always",      // mount lại → fetch nền, vẫn show cache ngay
      refetchOnReconnect: "always",  // online lại → đồng bộ
      refetchOnWindowFocus: false,   // tránh spam khi switch tab
      retry: 1,
      structuralSharing: true,       // chỉ đổi reference khi data thực sự khác
      networkMode: "offlineFirst",   // có cache thì dùng cache, không chờ network
    },
  },
});


// Persist toàn bộ React Query cache vào localStorage để vào lại trang là hiển thị tức thì
const SNAPSHOT_BUSTER = "v2-2026-06-26"; // bump để xóa snapshot mockup cũ
const SNAPSHOT_KEY = "app-query-cache-v2";
const SNAPSHOT_VERSION_KEY = "app-query-cache-version";
const OLD_SNAPSHOT_KEYS = ["app-query-cache-v1", "REACT_QUERY_OFFLINE_CACHE"];

// Dọn các snapshot cũ (mockup lỗi) ngay khi app khởi động
if (typeof window !== "undefined") {
  try {
    OLD_SNAPSHOT_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

const persister = typeof window !== "undefined"
  ? createSyncStoragePersister({
      storage: window.localStorage,
      key: SNAPSHOT_KEY,
      throttleTime: 200,
    })
  : undefined;

if (typeof window !== "undefined" && persister) {
  const writeSnapshot = () => {
    void Promise.resolve(persister.persistClient({
      buster: SNAPSHOT_BUSTER,
      timestamp: Date.now(),
      clientState: {
        mutations: [],
        queries: queryClient.getQueryCache().getAll().map((q) => ({
          queryKey: q.queryKey,
          queryHash: q.queryHash,
          state: q.state,
        })) as never,
      },
    })).catch(() => {});
  };

  // Snapshot ngay khi MỖI query fetch thành công → lần load sau hiện tức thì
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === "updated" && event.query.state.status === "success") {
      writeSnapshot();
    }
  });

  // Snapshot + bump version sau mỗi mutation thành công (admin chỉnh sửa)
  queryClient.getMutationCache().subscribe((event) => {
    if (event?.type === "updated" && event.mutation?.state.status === "success") {
      writeSnapshot();
      try { localStorage.setItem(SNAPSHOT_VERSION_KEY, String(Date.now())); } catch {}
    }
  });

  // Tab khác cập nhật → invalidate để hiển thị bản mới
  window.addEventListener("storage", (e) => {
    if (e.key === SNAPSHOT_VERSION_KEY) queryClient.invalidateQueries();
  });
}

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const Providers = ({ children }: { children: React.ReactNode }) =>
  persister ? (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000, buster: SNAPSHOT_BUSTER }}
    >
      {children}
    </PersistQueryClientProvider>
  ) : (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );


const App = () => (
  <Providers>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store/:slug" element={<StoreDetail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<ProfileManager />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="activities" element={<ActivitiesManager />} />
              <Route path="experiences" element={<ExperiencesManager />} />
              <Route path="education" element={<EducationManager />} />
              <Route path="blog" element={<BlogManager />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="custom-sections" element={<CustomSectionsManager />} />
              <Route path="store" element={<StoreManager />} />
              <Route path="vouchers" element={<VouchersManager />} />
              <Route path="testimonials" element={<TestimonialsManager />} />
              <Route path="contacts" element={<ContactManager />} />
              <Route path="guide" element={<Guide />} />
              <Route path="branding" element={<BrandingManager />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="categories" element={<CategoriesManager />} />
              <Route path="chatbot" element={<ChatbotManager />} />
              <Route path="sections-order" element={<SectionsOrderManager />} />
              <Route path="bookings" element={<BookingsManager />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <BackToTop />
        <ChatbotWidget />
        <FaviconUpdater />
        <ColorThemeApplier />
        <FontThemeApplier />
      </BrowserRouter>
    </TooltipProvider>
  </Providers>
);

export default App;
