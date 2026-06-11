import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const RouteLoading = () => (
  <div className="container flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
    Checking access...
  </div>
);

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (requireAdmin && !isAdmin) return <Navigate to="/member" replace />;

  return children;
};

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <RouteLoading />;
  if (user) return <Navigate to={isAdmin ? "/admin" : "/member"} replace />;

  return children;
};
