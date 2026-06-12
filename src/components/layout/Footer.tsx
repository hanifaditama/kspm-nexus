import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-primary text-primary-foreground">
    <div className="container py-16">
      <div className="grid gap-12 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/uphic-logo.png" alt="" className="h-11 w-auto object-contain brightness-0 invert" />
            <span className="text-lg font-semibold">Investment Club by UPH</span>
          </div>
          <p className="text-sm leading-relaxed text-primary-foreground/70">
            Capital Market Study Group — empowering students with financial literacy and capital market knowledge.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Navigation</h4>
          <nav className="flex flex-col gap-2">
            {["About", "Programs", "Articles", "Events"].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                {item}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Organization</h4>
          <nav className="flex flex-col gap-2">
            {["Team"].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                {item}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Connect</h4>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <span>@kspm_official</span>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-primary-foreground/10 pt-8 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} Investment Club by UPH. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
