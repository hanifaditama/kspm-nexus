import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
const WorkRequests = lazy(() => import("./pages/WorkRequests"));
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
  <HelmetProvider>
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
                  <Route path="/member/work-requests" element={<ProtectedRoute><WorkRequests /></ProtectedRoute>} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminHome />} />
                    <Route path="articles" element={<AdminArticles />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="team" element={<AdminTeam />} />
                    <Route path="programs" element={<AdminPrograms />} />
                    <Route path="recruitment" element={<AdminRecruitment />} />
                    <Route path="access" element={<ProtectedRoute requireAdmin><AdminAccess /></ProtectedRoute>} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
