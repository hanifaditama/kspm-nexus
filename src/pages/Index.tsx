import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "@/components/cards/ArticleCard";
import EventCard from "@/components/cards/EventCard";
import TeamCard from "@/components/cards/TeamCard";
import { getArticles, getEvents, getTeam } from "@/lib/content";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getArticles(), getEvents(), getTeam()])
      .then(([arts, evts, tm]) => {
        setArticles((arts as any[]).slice(0, 3));
        setEvents((evts as any[]).slice(0, 3));
        setTeam((tm as any[]).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Gradient background with decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--navy-dark))] via-[hsl(var(--primary))] to-[hsl(var(--navy-light))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--gold)/0.1),transparent_60%)]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="container relative z-10 py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <span className="animate-fade-up mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              KSPM UPH
            </span>
            <h1 className="animate-fade-up-delay-1 font-heading text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Kelompok Studi{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(40,80%,65%)] bg-clip-text text-transparent">
                Pasar Modal
              </span>
            </h1>
            <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              Empowering students with knowledge in capital markets, investment, and financial literacy through education, research, and community.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/about"
                className="rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-[hsl(var(--primary))] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                Learn More
              </Link>
              <Link
                to="/recruitment"
                className="rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Join Us
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 36.7 960 43.3 1080 45C1200 46.7 1320 43.3 1380 41.7L1440 40V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>


      {/* Latest Articles */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">Articles</span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Latest Articles</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Stay updated with our latest insights and research.</p>
          </div>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-muted" />
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
      <section className="border-y border-border bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">Events</span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Upcoming Events</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Join our seminars, workshops, and competitions.</p>
          </div>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-muted" />
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
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">Team</span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Our Team</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Meet the people behind KSPM UPH.</p>
          </div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-muted" />
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
      <section className="border-t border-border">
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--navy-light))] p-10 text-center shadow-xl md:p-16">
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">Ready to Join KSPM?</h2>
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
    </div>
  );
};

export default Index;
