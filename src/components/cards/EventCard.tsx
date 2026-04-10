import { useState } from "react";
import type { Event } from "@/types/content";
import { Calendar, Clock, MapPin, Users, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const typeColors: Record<string, string> = {
  seminar: "bg-accent/10 text-accent",
  workshop: "bg-[hsl(var(--gold))/0.1] text-[hsl(var(--gold))]",
  competition: "bg-destructive/10 text-destructive",
  webinar: "bg-primary/10 text-primary",
};

const EventCard = ({ event }: { event: Event }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        className="group cursor-pointer rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${typeColors[event.type] || ""}`}>
            {event.type}
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-card-foreground">{event.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          {event.time && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{event.time}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <div className="mb-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${typeColors[event.type] || ""}`}>
                {event.type}
              </span>
            </div>
            <DialogTitle className="text-xl font-semibold text-card-foreground">{event.title}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground pt-2">
              {event.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-3 rounded-md border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-foreground">
                {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-foreground">{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-foreground">{event.location}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
