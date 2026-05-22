import { useState, useEffect } from "react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import EventCard from "@/components/cards/EventCard";
import { getEvents } from "@/lib/content";

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <SectionHeader
        label="Events"
        title="Upcoming Events"
        description="Join our seminars, workshops, and competitions to expand your knowledge and network."
      />

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
          <p className="mt-1 text-sm">Check back soon or add events in the Sanity Studio.</p>
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
