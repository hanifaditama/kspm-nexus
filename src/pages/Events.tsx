import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import EventCard from "@/components/cards/EventCard";
import { useEvents } from "@/hooks/useContentQueries";
import SEO from "@/components/SEO";

const Events = () => {
  const { data: events = [], isLoading: loading, error } = useEvents();
  const now = Date.now();
  const upcomingEvents = events.filter((event) => new Date(event.date).getTime() >= now);
  const pastEvents = events
    .filter((event) => new Date(event.date).getTime() < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Section>
      <SEO title="Events" path="/events" description="Discover upcoming and past events, seminars, workshops, company visits, and investment-related activities by UPH Investment Club." />
      <SectionHeader
        label="Events"
        title="Events and Experiences"
        description="Meet professionals, practice real skills, and grow your network through seminars, workshops, competitions, and community programs."
        headingLevel="h1"
      />
      {error && <p className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">Events could not be loaded.</p>}

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No events scheduled yet.</p>
          <p className="mt-1 text-sm">Check back soon or add events from the admin panel.</p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-16">
          <section aria-labelledby="upcoming-events">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">Coming Up</p>
                <h2 id="upcoming-events" className="mt-1 text-2xl font-bold text-foreground">Upcoming Events</h2>
              </div>
              <span className="text-sm text-muted-foreground">{upcomingEvents.length} scheduled</span>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => <EventCard key={event._id} event={event} />)}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                New events will be announced soon.
              </p>
            )}
          </section>

          {pastEvents.length > 0 && (
            <section aria-labelledby="past-events">
              <div className="mb-6 border-b border-border pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">Previously</p>
                <h2 id="past-events" className="mt-1 text-2xl font-bold text-foreground">Past Events</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => <EventCard key={event._id} event={event} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </Section>
  );
};

export default Events;
