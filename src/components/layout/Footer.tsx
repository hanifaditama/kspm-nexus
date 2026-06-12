import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-primary text-primary-foreground">
    <div className="container py-16">
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
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
            {["About", "Programs", "Articles", "Events", "Team"].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                {item}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Contact Us</h4>
          <a
            href="mailto:investment.club@uph.edu"
            className="flex items-center gap-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="break-all">investment.club@uph.edu</span>
          </a>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Our Social Media</h4>
          <div className="flex flex-col gap-3 text-sm">
            <a
              href="https://www.instagram.com/uph_investmentgallery/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>@uph_investmentgallery</span>
            </a>
            <a
              href="https://medium.com/@uphinvestmentclub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center font-serif text-base font-bold" aria-hidden="true">M</span>
              <span>@uphinvestmentclub</span>
            </a>
            <a
              href="https://www.linkedin.com/company/galeri-investasi-uph-karawaci/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              <Linkedin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Galeri Investasi UPH</span>
            </a>
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
