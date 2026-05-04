import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Store from "./pages/Store";
import StoreDetail from "./pages/StoreDetail";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ProfileManager from "./pages/admin/ProfileManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import SettingsManager from "./pages/admin/SettingsManager";
import ActivitiesManager from "./pages/admin/ActivitiesManager";
import ExperiencesManager from "./pages/admin/ExperiencesManager";
import EducationManager from "./pages/admin/EducationManager";
import BlogManager from "./pages/admin/BlogManager";
import MediaLibrary from "./pages/admin/MediaLibrary";
import CustomSectionsManager from "./pages/admin/CustomSectionsManager";
import StoreManager from "./pages/admin/StoreManager";
import VouchersManager from "./pages/admin/VouchersManager";
import TestimonialsManager from "./pages/admin/TestimonialsManager";
import ContactManager from "./pages/admin/ContactManager";
import Guide from "./pages/admin/Guide";
import BrandingManager from "./pages/admin/BrandingManager";
import OrdersManager from "./pages/admin/OrdersManager";
import CategoriesManager from "./pages/admin/CategoriesManager";
import ChatbotManager from "./pages/admin/ChatbotManager";
import SectionsOrderManager from "./pages/admin/SectionsOrderManager";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import BackToTop from "./components/BackToTop";
import ChatbotWidget from "./components/ChatbotWidget";
import FaviconUpdater from "./components/FaviconUpdater";
import ColorThemeApplier from "./components/ColorThemeApplier";
import FontThemeApplier from "./components/FontThemeApplier";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
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
