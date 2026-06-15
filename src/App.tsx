import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Programs = lazy(() => import("./pages/Programs"));
const Articles = lazy(() => import("./pages/Articles"));
const Events = lazy(() => import("./pages/Events"));
const Team = lazy(() => import("./pages/Team"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const MemberLogin = lazy(() => import("./pages/MemberLogin"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const ScreeningDashboard = lazy(() => import("./pages/ScreeningDashboard"));
const MemberCalendar = lazy(() => import("./pages/MemberCalendar"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminArticles = lazy(() => import("./pages/admin/AdminArticles"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminPrograms = lazy(() => import("./pages/admin/AdminPrograms"));
const AdminRecruitment = lazy(() => import("./pages/admin/AdminRecruitment"));
const AdminAccess = lazy(() => import("./pages/admin/AdminAccess"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
    Loading...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/articles/:slug" element={<ArticleDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/team" element={<Team />} />
                <Route path="/recruitment" element={<Recruitment />} />
                <Route path="/login" element={<PublicOnlyRoute><MemberLogin /></PublicOnlyRoute>} />
                <Route path="/member" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
                <Route path="/member/screening" element={<ProtectedRoute><ScreeningDashboard /></ProtectedRoute>} />
                <Route path="/member/calendar" element={<ProtectedRoute><MemberCalendar /></ProtectedRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<ProtectedRoute requireContentManager><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminHome />} />
                  <Route path="articles" element={<ProtectedRoute requirePermission="articles"><AdminArticles /></ProtectedRoute>} />
                  <Route path="events" element={<ProtectedRoute requirePermission="events"><AdminEvents /></ProtectedRoute>} />
                  <Route path="team" element={<ProtectedRoute requirePermission="team"><AdminTeam /></ProtectedRoute>} />
                  <Route path="programs" element={<ProtectedRoute requirePermission="programs"><AdminPrograms /></ProtectedRoute>} />
                  <Route path="recruitment" element={<ProtectedRoute requirePermission="recruitment"><AdminRecruitment /></ProtectedRoute>} />
                  <Route path="access" element={<ProtectedRoute requirePrimaryAdmin><AdminAccess /></ProtectedRoute>} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
