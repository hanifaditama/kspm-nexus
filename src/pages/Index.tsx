import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ArticleCard from "@/components/cards/ArticleCard";
import EventCard from "@/components/cards/EventCard";
import TeamCard from "@/components/cards/TeamCard";
import { getArticles, getEvents, getTeam, getPrograms } from "@/lib/sanity";
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
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/30">
        <div className="container py-20 text-center md:py-32">
          <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            KSPM UPH
          </span>
          <h1 className="mx-auto max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Kelompok Studi Pasar Modal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Empowering students with knowledge in capital markets, investment, and financial literacy through education, research, and community.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/about"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Learn More
            </Link>
            <Link
              to="/recruitment"
              className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <Section>
        <div className="flex items-center justify-between">
          <SectionHeader label="Articles" title="Latest Articles" description="Stay updated with our latest insights and research." />
        </div>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-muted" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/articles" className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80">
                View All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">No articles yet.</p>
        )}
      </Section>

      {/* Upcoming Events */}
      <Section>
        <SectionHeader label="Events" title="Upcoming Events" description="Join our seminars, workshops, and competitions." />
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-muted" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80">
                View All Events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">No events scheduled yet.</p>
        )}
      </Section>

      {/* Team Preview */}
      <Section>
        <SectionHeader label="Team" title="Our Team" description="Meet the people behind KSPM UPH." />
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-lg border border-border bg-muted" />
            ))}
          </div>
        ) : team.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {team.map((m) => (
                <TeamCard key={m._id} member={m} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/team" className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80">
                View Full Team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">No team members yet.</p>
        )}
      </Section>
    </div>
  );
};

export default Index;
