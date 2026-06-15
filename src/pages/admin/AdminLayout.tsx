import { Link, Outlet, useLocation } from "react-router-dom";
import { FileText, Calendar, Users, BookOpen, LayoutDashboard, ArrowLeft, ShieldCheck, UserPlus, FileCheck2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ContentPermission } from "@/lib/contentAccess";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/articles", label: "Articles", icon: FileText, permission: "articles" as ContentPermission },
  { to: "/admin/events", label: "Events", icon: Calendar, permission: "events" as ContentPermission },
  { to: "/admin/team", label: "Team", icon: Users, permission: "team" as ContentPermission },
  { to: "/admin/programs", label: "Programs", icon: BookOpen, permission: "programs" as ContentPermission },
  { to: "/admin/recruitment", label: "Recruitment Page", icon: UserPlus, permission: "recruitment" as ContentPermission },
  { to: "/member/screening", label: "Screening Dashboard", icon: FileCheck2, permission: "screening" as ContentPermission },
  { to: "/admin/access", label: "Access Control", icon: ShieldCheck, primaryAdminOnly: true },
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { isPrimaryAdmin, hasPermission } = useAuth();
  const visibleItems = navItems.filter((item) => {
    if (item.primaryAdminOnly) return isPrimaryAdmin;
    return !item.permission || hasPermission(item.permission);
  });

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
            {visibleItems.map((item) => {
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
