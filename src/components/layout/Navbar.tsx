import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, Settings, LogOut, FolderOpen, FileCheck2, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Programs", path: "/programs" },
  { label: "Articles", path: "/articles" },
  { label: "Events", path: "/events" },
  { label: "Team", path: "/team" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isOpen: isRecruitmentOpen } = useRecruitmentStatus();
  const firstName = (profile?.display_name ?? user?.email ?? "Member").split(/\s+/)[0];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="UPH Investment Club home">
          <img src="/uphic-logo.webp" alt="UPH Investment Club" width={300} height={116} fetchPriority="high" className="h-9 w-auto object-contain" />
          <span className="hidden text-sm font-semibold text-foreground lg:inline">UPH Investment Club</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                pathname === link.path ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Recruitment Status */}
          {isRecruitmentOpen ? (
            <Link
              to="/recruitment"
              className="hidden items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20 sm:inline-flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Open Recruitment
            </Link>
          ) : (
            <span className="hidden items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              Recruitment Closed
            </span>
          )}

          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden items-center gap-3 rounded-full bg-[#f1f1ef] px-2 py-1.5 text-left transition-colors hover:bg-[#e8e8e4] sm:inline-flex">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e7e2dc] text-xs font-semibold text-[#191916]">
                    {firstName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden lg:block">
                    <span className="block max-w-36 truncate text-xs font-semibold text-[#191916]">{profile?.display_name ?? firstName}</span>
                    <span className="block max-w-36 truncate text-[11px] text-[#7a7972]">{user.email}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl border-black/5 bg-white p-2 shadow-[0_24px_60px_rgba(24,24,20,0.14)]">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-[#191916]">{profile?.display_name ?? firstName}</p>
                  <p className="truncate text-xs text-[#7a7972]">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/member/calendar" className="flex items-center gap-2 rounded-xl">
                    <CalendarDays className="h-4 w-4" />
                    Member Calendar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/member/screening" className="flex items-center gap-2 rounded-xl">
                    <FileCheck2 className="h-4 w-4" />
                    Screening Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/member" className="flex items-center gap-2 rounded-xl">
                    <FolderOpen className="h-4 w-4" />
                    File Manager
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2 rounded-xl">
                    <Settings className="h-4 w-4" />
                    Content Panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 sm:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5" />
              Member
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  pathname === link.path ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isRecruitmentOpen && (
              <Link
                to="/recruitment"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm font-semibold text-accent"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Open Recruitment
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/member/calendar"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground"
                >
                  <CalendarDays className="h-4 w-4" />
                  Member Calendar
                </Link>
                <Link
                  to="/member/screening"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground"
                >
                  <FileCheck2 className="h-4 w-4" />
                  Screening Dashboard
                </Link>
                <Link
                  to="/member"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground"
                >
                  <FolderOpen className="h-4 w-4" />
                  File Manager
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Content Panel
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                <LogIn className="h-4 w-4" />
                Member Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
