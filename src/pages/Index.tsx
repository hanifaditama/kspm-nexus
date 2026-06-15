import { Link } from "react-router-dom";
import ArticleCard from "@/components/cards/ArticleCard";
import EventCard from "@/components/cards/EventCard";
import TeamCard from "@/components/cards/TeamCard";
import { useArticles, useEvents, useTeam } from "@/hooks/useContentQueries";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import { ArrowRight } from "lucide-react";
import MarketTicker from "@/components/MarketTicker";
import SEO from "@/components/SEO";

const Index = () => {
  const articlesQuery = useArticles(3);
  const eventsQuery = useEvents(3);
  const teamQuery = useTeam(4);
  const articles = articlesQuery.data ?? [];
  const events = eventsQuery.data ?? [];
  const team = teamQuery.data ?? [];
  const loading = articlesQuery.isLoading || eventsQuery.isLoading || teamQuery.isLoading;
  const loadError = articlesQuery.error || eventsQuery.error || teamQuery.error;
  const { isOpen: isRecruitmentOpen } = useRecruitmentStatus();

  return (
    <div>
      <SEO
        description="A student-led investment and capital market community empowering UPH students through research, education, events, and financial market activities."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "UPH Investment Club",
          alternateName: "UPHIC",
          url: "https://investmentclubuph.vercel.app",
          logo: "https://investmentclubuph.vercel.app/uphic-logo.png",
          email: "investment.club@uph.edu",
          sameAs: [
            "https://www.instagram.com/uph_investmentgallery/",
            "https://medium.com/@uphinvestmentclub",
            "https://www.linkedin.com/company/galeri-investasi-uph-karawaci/",
          ],
        }}
      />
      {loadError && (
        <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          Some live content could not be loaded. Please try again shortly.
        </div>
      )}
      <MarketTicker />
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient background with decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--navy-dark))] via-[hsl(var(--primary))] to-[hsl(var(--navy-light))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--gold)/0.1),transparent_60%)]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="container relative z-10 py-24 md:py-36">
          <div className="mx-auto max-w-5xl text-center">
            <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              UPH Investment Club
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              UPH{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(40,80%,65%)] bg-clip-text text-transparent">
                Investment Club
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              Empowering students with knowledge in capital markets, investment, and financial literacy through education, research, and community.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/about"
                className="rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-[hsl(var(--primary))] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                Learn More
              </Link>
              {isRecruitmentOpen && (
                <Link
                  to="/recruitment"
                  className="rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Latest Articles */}
      <section className="content-auto py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">Articles</span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Latest Articles</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Stay updated with our latest insights and research.</p>
          </div>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[380px] animate-pulse rounded-xl border border-border bg-muted" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link to="/articles" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:shadow-sm">
                  View All Articles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No articles yet.</p>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="content-auto border-y border-border bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">Events</span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Upcoming Events</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Join our seminars, workshops, and competitions.</p>
          </div>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((e) => (
                  <EventCard key={e._id} event={e} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link to="/events" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:shadow-sm">
                  View All Events <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No events scheduled yet.</p>
          )}
        </div>
      </section>

      {/* Team Preview */}
      <section className="content-auto py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">Team</span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Our Team</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Meet the people behind UPH Investment Club.</p>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-60 animate-pulse rounded-xl border border-border bg-muted" />
              ))}
            </div>
          ) : team.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {team.map((m) => (
                  <TeamCard key={m._id} member={m} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link to="/team" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:shadow-sm">
                  View Full Team <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No team members yet.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      {isRecruitmentOpen && (
        <section className="content-auto border-t border-border">
          <div className="container py-20 md:py-28">
            <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--navy-light))] p-10 text-center shadow-xl md:p-16">
              <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">Ready to Join UPH Investment Club?</h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/75">
                Be part of a community passionate about capital markets and financial literacy.
              </p>
              <Link
                to="/recruitment"
                className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-[hsl(var(--primary))] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
