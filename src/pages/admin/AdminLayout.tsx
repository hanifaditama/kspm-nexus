import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import WorkspaceTopbarTools from "@/components/dashboard/WorkspaceTopbarTools";
import WorkspaceThemeSwitch from "@/components/dashboard/WorkspaceThemeSwitch";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/articles", label: "Articles", icon: FileText },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/programs", label: "Programs", icon: BookOpen },
  { to: "/admin/recruitment", label: "Recruitment", icon: UserPlus },
  { to: "/member/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/member/work-requests", label: "Requests", icon: ClipboardList },
  { to: "/admin/access", label: "Access", icon: ShieldCheck, adminOnly: true },
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <section className="min-h-screen bg-[#f1f1ef] text-[#191916] dark:bg-[#11100e] dark:text-white">
      <header className="sticky top-0 z-40 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex w-full gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-[0_16px_40px_rgba(24,24,20,0.08)] dark:bg-[#1c1b18] lg:w-auto">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium text-[#5e5d57] transition-colors hover:bg-[#f1f1ef] hover:text-[#191916] dark:text-[#c9c7bd] dark:hover:bg-white/10 dark:hover:text-white",
                      isActive && "bg-[#1d1c18] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-[#1d1c18] hover:text-white dark:bg-white dark:text-[#191916] dark:hover:bg-white dark:hover:text-[#191916]",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <WorkspaceTopbarTools navItems={visibleItems.map(({ to, label, icon }) => ({ to, label, icon }))} />
          </div>
        </div>
      </header>

      <aside className="fixed left-5 top-24 z-30 hidden w-12 flex-col items-center gap-4 lg:flex">
        <WorkspaceThemeSwitch />
        <nav className="grid gap-1 rounded-full bg-white p-1.5 shadow-[0_16px_40px_rgba(24,24,20,0.08)] dark:bg-[#1c1b18]">
          {visibleItems.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-[#5e5d57] transition-colors hover:bg-[#f1f1ef] hover:text-[#191916] dark:text-[#c9c7bd] dark:hover:bg-white/10 dark:hover:text-white",
                  active && "bg-[#1d1c18] text-white hover:bg-[#1d1c18] hover:text-white dark:bg-white dark:text-[#191916] dark:hover:bg-white dark:hover:text-[#191916]",
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="px-4 pb-8 sm:px-6 lg:pl-24 lg:pr-8">
        <div className="mx-auto max-w-[1540px]">
          <Link to="/" className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-[#5e5d57] shadow-sm hover:text-[#191916] dark:bg-[#1c1b18] dark:text-[#c9c7bd] dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default AdminLayout;
