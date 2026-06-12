import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { ContentPermission } from "@/lib/contentAccess";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireContentManager?: boolean;
  requirePermission?: ContentPermission;
}

const RouteLoading = () => (
  <div className="container flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
    Checking access...
  </div>
);

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireContentManager = false,
  requirePermission,
}: ProtectedRouteProps) => {
  const { user, isAdmin, canManageContent, mustChangePassword, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (mustChangePassword && location.pathname !== "/reset-password") return <Navigate to="/reset-password" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/member" replace />;
  if (requireContentManager && !canManageContent) return <Navigate to="/member" replace />;
  if (requirePermission && !hasPermission(requirePermission)) return <Navigate to="/admin" replace />;

  return children;
};

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, canManageContent, mustChangePassword, loading } = useAuth();

  if (loading) return <RouteLoading />;
  if (user) return <Navigate to={mustChangePassword ? "/reset-password" : canManageContent ? "/admin" : "/member"} replace />;

  return children;
};
