import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — avoid refetching on every nav
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);

export default App;
