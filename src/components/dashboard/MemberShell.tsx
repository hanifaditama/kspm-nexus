import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  FolderOpen,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WorkspaceTopbarTools from "./WorkspaceTopbarTools";
import WorkspaceThemeSwitch from "./WorkspaceThemeSwitch";

interface MemberShellProps {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  backToDashboard?: boolean;
}

const navItems = [
  { to: "/member", label: "Overview", railLabel: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/member/calendar", label: "Calendar", railLabel: "Calendar", icon: CalendarDays },
  { to: "/member/screening", label: "Screening", railLabel: "Screening", icon: FileCheck2 },
  { to: "/member/work-requests", label: "Requests", railLabel: "Work Requests", icon: ClipboardList },
];

const MemberShell = ({ title, description, eyebrow, icon: Icon = FolderOpen, actions, children, backToDashboard = true }: MemberShellProps) => {
  const { pathname } = useLocation();
  const showBack = backToDashboard && pathname !== "/member";
  const topbarItems = [...navItems, { to: "/admin", label: "Manage", railLabel: "Admin Panel", icon: Settings }];

  return (
    <section className="min-h-screen bg-[#f1f1ef] text-[#191916] dark:bg-[#11100e] dark:text-white">
      <header className="sticky top-0 z-40 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex w-full gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-[0_16px_40px_rgba(24,24,20,0.08)] dark:bg-[#1c1b18] lg:w-auto">
            {topbarItems.map(({ to, label, icon: ItemIcon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium text-[#5e5d57] transition-colors hover:bg-[#f1f1ef] hover:text-[#191916] dark:text-[#c9c7bd] dark:hover:bg-white/10 dark:hover:text-white",
                    isActive && "bg-[#1d1c18] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-[#1d1c18] hover:text-white dark:bg-white dark:text-[#191916] dark:hover:bg-white dark:hover:text-[#191916]",
                  )
                }
              >
                <ItemIcon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <WorkspaceTopbarTools navItems={topbarItems} />
          </div>
        </div>
      </header>

      <aside className="fixed left-5 top-24 z-30 hidden w-12 flex-col items-center gap-4 lg:flex">
        <WorkspaceThemeSwitch />
        <nav className="grid gap-1 rounded-full bg-white p-1.5 shadow-[0_16px_40px_rgba(24,24,20,0.08)] dark:bg-[#1c1b18]">
          {topbarItems.map(({ to, railLabel, label, icon: ItemIcon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={railLabel ?? label}
              className={({ isActive }) =>
                cn(
                  "grid h-9 w-9 place-items-center rounded-full text-[#5e5d57] transition-colors hover:bg-[#f1f1ef] hover:text-[#191916] dark:text-[#c9c7bd] dark:hover:bg-white/10 dark:hover:text-white",
                  isActive && "bg-[#1d1c18] text-white hover:bg-[#1d1c18] hover:text-white dark:bg-white dark:text-[#191916] dark:hover:bg-white dark:hover:text-[#191916]",
                )
              }
            >
              <ItemIcon className="h-4 w-4" />
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="px-4 pb-8 sm:px-6 lg:pl-24 lg:pr-8">
        <div className="mx-auto max-w-[1540px]">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-sm dark:bg-[#1c1b18]">
                <Icon className="h-5 w-5 text-[#191916] dark:text-white" />
              </span>
              <div className="min-w-0">
                {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-[#7a7972] dark:text-[#b6b3aa]">{eyebrow}</p>}
                <h1 className="text-3xl font-semibold tracking-normal text-[#191916] dark:text-white">{title}</h1>
                {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-[#686760] dark:text-[#b6b3aa]">{description}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {showBack && (
                <Button variant="outline" size="sm" asChild className="rounded-full border-black/10 bg-white dark:border-white/10 dark:bg-[#1c1b18]">
                  <Link to="/member">
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                  </Link>
                </Button>
              )}
              {actions}
            </div>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
};

export default MemberShell;
