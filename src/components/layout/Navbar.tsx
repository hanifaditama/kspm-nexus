import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Programs", path: "/programs" },
  { label: "Articles", path: "/articles" },
  { label: "Events", path: "/events" },
  { label: "Team", path: "/team" },
  { label: "Contact", path: "/contact" },
];

// Toggle this to control recruitment status site-wide
const isRecruitmentOpen = true;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">KS</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">KSPM</span>
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
              Closed
            </span>
          )}

          {/* Member Login/Dashboard */}
          {user ? (
            <Link
              to="/member"
              className="hidden items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 sm:inline-flex"
            >
              <User className="h-3.5 w-3.5" />
              Dashboard
            </Link>
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
            <Link
              to={user ? "/member" : "/login"}
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              {user ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {user ? "Dashboard" : "Member Login"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
