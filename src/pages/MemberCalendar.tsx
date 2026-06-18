import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import MemberShell from "@/components/dashboard/MemberShell";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAccessDeniedToast from "@/hooks/useAccessDeniedToast";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  color: string;
}

const emptyForm = { title: "", event_date: "", end_date: "", color: "#2563eb" };
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MemberCalendar = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const denyAccess = useAccessDeniedToast();
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const canEdit = hasPermission("calendar");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id,title,event_date,end_date,color")
      .order("event_date");
    setLoading(false);
    if (error) {
      toast({ title: "Could not load calendar", description: error.message, variant: "destructive" });
      return;
    }
    setEvents((data ?? []) as CalendarEvent[]);
  }, [toast]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    const result: Date[] = [];
    for (let current = start; current <= end; current = addDays(current, 1)) result.push(current);
    return result;
  }, [month]);

  const eventsForDate = (date: Date) => {
    const value = format(date, "yyyy-MM-dd");
    return events.filter((event) => value >= event.event_date && value <= (event.end_date ?? event.event_date));
  };

  const openCreate = (date = new Date()) => {
    if (!canEdit) return denyAccess("You don't have access to add calendar events.");
    const value = format(date, "yyyy-MM-dd");
    setEditingEvent(null);
    setForm({ ...emptyForm, event_date: value });
    setDialogOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    if (!canEdit) return denyAccess("You don't have access to edit calendar events.");
    setEditingEvent(event);
    setForm({ title: event.title, event_date: event.event_date, end_date: event.end_date ?? "", color: event.color });
    setDialogOpen(true);
  };

  const saveEvent = async () => {
    if (!canEdit) return denyAccess("You don't have access to save calendar events.");
    if (!user || !form.title.trim() || !form.event_date) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      event_date: form.event_date,
      end_date: form.end_date || null,
      color: form.color,
    };
    const result = editingEvent
      ? await supabase.from("calendar_events").update(payload).eq("id", editingEvent.id)
      : await supabase.from("calendar_events").insert({ ...payload, created_by: user.id });
    setSaving(false);
    if (result.error) {
      toast({ title: "Could not save calendar event", description: result.error.message, variant: "destructive" });
      return;
    }
    setDialogOpen(false);
    toast({ title: editingEvent ? "Calendar event updated" : "Calendar event added" });
    void loadEvents();
  };

  const deleteEvent = async () => {
    if (!canEdit) return denyAccess("You don't have access to delete calendar events.");
    if (!editingEvent || !confirm(`Delete "${editingEvent.title}"?`)) return;
    setSaving(true);
    const { error } = await supabase.from("calendar_events").delete().eq("id", editingEvent.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not delete calendar event", description: error.message, variant: "destructive" });
      return;
    }
    setDialogOpen(false);
    setEvents((current) => current.filter((event) => event.id !== editingEvent.id));
  };

  return (
    <MemberShell
      title="Member Calendar"
      eyebrow="Schedule"
      icon={CalendarDays}
      description="Internal schedule for UPH Investment Club members."
      actions={<Button onClick={() => openCreate()} className="rounded-full bg-[#1d1c18] text-white hover:bg-[#34322d]"><Plus className="h-4 w-4" /> Add Event</Button>}
    >
      <div className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-[#1c1b18]">
        <div className="flex items-center justify-between border-b border-black/5 bg-white px-3 py-3 dark:border-white/10 dark:bg-[#1c1b18]">
          <Button variant="ghost" size="icon" title="Previous month" onClick={() => setMonth((current) => subMonths(current, 1))}><ChevronLeft className="h-5 w-5" /></Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{format(month, "MMMM yyyy")}</h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setMonth(new Date())}>Today</Button>
          </div>
          <Button variant="ghost" size="icon" title="Next month" onClick={() => setMonth((current) => addMonths(current, 1))}><ChevronRight className="h-5 w-5" /></Button>
        </div>

        {loading ? (
          <div className="flex min-h-96 items-center justify-center gap-2 bg-white text-sm text-muted-foreground dark:bg-[#1c1b18]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading calendar...
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-[#1c1b18]">
            <div className="grid min-w-[760px] grid-cols-7">
              {weekdays.map((day) => <div key={day} className="border-b border-r border-black/5 bg-[#f6f7f5] px-2 py-2 text-center text-xs font-semibold uppercase text-[#585956] last:border-r-0 dark:border-white/10 dark:bg-white/5 dark:text-[#b6b3aa]">{day}</div>)}
              {days.map((date) => {
                const dateEvents = eventsForDate(date);
                return (
                  <div
                    key={date.toISOString()}
                    role="button"
                    tabIndex={0}
                    className={`min-h-32 border-b border-r border-black/5 p-2 text-left align-top transition-colors hover:bg-[#f1f1ef] dark:border-white/10 dark:hover:bg-white/10 ${!isSameMonth(date, month) ? "bg-[#f6f7f5] text-muted-foreground/50 dark:bg-white/5 dark:text-white/35" : "bg-white dark:bg-[#1c1b18] dark:text-white"}`}
                    onClick={() => openCreate(date)}
                  >
                    <span className="text-xs font-semibold">{format(date, "d")}</span>
                    <span className="mt-2 flex flex-col gap-1">
                      {dateEvents.map((event) => (
                        <span
                          key={event.id}
                          role="button"
                          tabIndex={0}
                          className="block truncate rounded px-1.5 py-1 text-[11px] font-medium text-white shadow-sm"
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                          onClick={(click) => { click.stopPropagation(); openEdit(event); }}
                        >
                          {event.title}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingEvent ? "Edit Calendar Event" : "Add Calendar Event"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label htmlFor="calendar-title">Event</Label><Input id="calendar-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label htmlFor="calendar-start">Start date</Label><Input id="calendar-start" type="date" value={form.event_date} onChange={(event) => setForm({ ...form, event_date: event.target.value })} /></div>
              <div className="grid gap-2"><Label htmlFor="calendar-end">End date</Label><Input id="calendar-end" type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} /></div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calendar-color">Color</Label>
              <div className="flex items-center gap-3">
                <Input id="calendar-color" type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} className="h-10 w-16 cursor-pointer p-1" />
                <Input value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <div>{editingEvent && <Button variant="destructive" onClick={() => void deleteEvent()} disabled={saving}><Trash2 className="h-4 w-4" /> Delete</Button>}</div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button disabled={saving || !form.title.trim() || !form.event_date} onClick={() => void saveEvent()}>{editingEvent && <Pencil className="h-4 w-4" />}{saving ? "Saving..." : "Save"}</Button></div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MemberShell>
  );
};

export default MemberCalendar;
