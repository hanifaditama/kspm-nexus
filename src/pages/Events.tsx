import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import EventCard from "@/components/cards/EventCard";
import { useEvents } from "@/hooks/useContentQueries";

const Events = () => {
  const { data: events = [], isLoading: loading, error } = useEvents();

  return (
    <Section>
      <SectionHeader
        label="Events"
        title="Upcoming Events"
        description="Join our seminars, workshops, and competitions to expand your knowledge and network."
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e._id} event={e} />
          ))}
        </div>
      )}
    </Section>
  );
};

export default Events;
