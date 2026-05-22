import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { FileText, Calendar, Users, BookOpen, LayoutDashboard, ArrowLeft } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/articles", label: "Articles", icon: FileText },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/programs", label: "Programs", icon: BookOpen },
];

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need admin permissions to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container grid gap-8 py-8 md:grid-cols-[220px_1fr]">
        <aside>
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Admin
          </h2>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
