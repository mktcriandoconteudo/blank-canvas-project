import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import Landing from "./pages/Landing";
import { useFavicon } from "./hooks/use-favicon";
import CookieConsent from "./components/CookieConsent";

// Lazy load heavy pages
const Index = lazy(() => import("./pages/Index"));
const ResortDetail = lazy(() => import("./pages/ResortDetail"));
const CondoDetail = lazy(() => import("./pages/CondoDetail"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminClients = lazy(() => import("./pages/AdminClients"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const OwnerRoute = lazy(() => import("./components/OwnerRoute"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyReservations = lazy(() => import("./pages/MyReservations"));
const MyAccount = lazy(() => import("./pages/MyAccount"));

const queryClient = new QueryClient();

const FaviconLoader = () => { useFavicon(); return null; };

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FaviconLoader />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Index />} />
            <Route path="/condo/:slug" element={<CondoDetail />} />
            <Route path="/resort/:slug/:aptSlug" element={<ResortDetail />} />
            <Route path="/resort/:slug" element={<ResortDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
            <Route path="/admin/clients" element={<AdminRoute><AdminLayout><AdminClients /></AdminLayout></AdminRoute>} />
            
            <Route path="/owner" element={<OwnerRoute><AdminLayout><OwnerDashboard /></AdminLayout></OwnerRoute>} />
            <Route path="/minhas-reservas" element={<MyReservations />} />
            <Route path="/minha-conta" element={<MyAccount />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
