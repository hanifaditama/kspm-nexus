import type { Event } from "@/types/content";
import { Calendar, Clock, MapPin } from "lucide-react";

const typeColors: Record<string, string> = {
  seminar: "bg-accent/10 text-accent",
  workshop: "bg-gold/10 text-gold",
  competition: "bg-destructive/10 text-destructive",
  webinar: "bg-primary/10 text-primary",
};

const EventCard = ({ event }: { event: Event }) => (
  <article className="group rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${typeColors[event.type] || ""}`}>
        {event.type}
      </span>
    </div>
    <h3 className="mb-2 text-lg font-semibold text-card-foreground">{event.title}</h3>
    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
    <div className="space-y-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5" />
        <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" />
        <span>{event.time}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5" />
        <span>{event.location}</span>
      </div>
    </div>
  </article>
);

export default EventCard;
