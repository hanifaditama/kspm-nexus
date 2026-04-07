import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import EventCard from "@/components/cards/EventCard";
import { events } from "@/data/mock";

const Events = () => (
  <Section>
    <SectionHeader
      label="Events"
      title="Upcoming Events"
      description="Join our seminars, workshops, and competitions to expand your knowledge and network."
    />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e._id} event={e} />
      ))}
    </div>
  </Section>
);

export default Events;
