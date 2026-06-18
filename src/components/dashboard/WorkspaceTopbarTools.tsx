import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  KeyRound,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ChangePasswordDialog from "./ChangePasswordDialog";

export interface WorkspaceNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  icon: LucideIcon;
}

interface DeadlineNotification {
  id: string;
  title: string;
  subtitle: string;
  dueDate: string;
  to: string;
  division: string;
  type: "Screening" | "Work request";
}

const divisions = ["BPH", "CMP", "EVENT", "RESEARCH"] as const;
type Division = (typeof divisions)[number];

const normalizeDivision = (value?: string | null): Division | null => {
  const normalized = (value ?? "").trim().toUpperCase();
  if (!normalized) return null;
  if (normalized.includes("RESEARCH")) return "RESEARCH";
  if (normalized.includes("EVENT")) return "EVENT";
  if (normalized.includes("BPH") || normalized.includes("BOARD") || normalized.includes("PRESIDENT")) return "BPH";
  if (normalized.includes("CMP") || normalized.includes("CREATIVE") || normalized.includes("MEDIA") || normalized.includes("PUBLICATION")) return "CMP";
  return null;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));

const daysUntil = (value: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${value}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
};

const themeClasses = {
  iconButton:
    "h-9 w-9 rounded-full text-[#5e5d57] hover:bg-[#f1f1ef] hover:text-[#191916] dark:text-[#c9c7bd] dark:hover:bg-white/10 dark:hover:text-white",
};

const WorkspaceTopbarTools = ({ navItems }: { navItems: WorkspaceNavItem[] }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [notifications, setNotifications] = useState<DeadlineNotification[]>([]);
  const firstName = (profile?.display_name ?? user?.email ?? "Member").split(/\s+/)[0];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Sign out failed", description: error, variant: "destructive" });
      return;
    }
    navigate("/");
  };

  const loadSearchItems = useCallback(async () => {
    const baseItems: SearchItem[] = navItems.map((item) => ({
      id: `nav:${item.to}`,
      title: item.label,
      subtitle: "Workspace section",
      to: item.to,
      icon: item.icon,
    }));
    setSearchItems(baseItems);

    const [articles, team, events, calendar, screening, workRequests] = await Promise.all([
      supabase.from("articles").select("title,slug,category").order("published_at", { ascending: false }).limit(8),
      supabase.from("team_members").select("name,role,division").order("display_order").limit(8),
      supabase.from("events").select("title,event_date").order("event_date", { ascending: false }).limit(8),
      supabase.from("calendar_events").select("title,event_date").order("event_date", { ascending: true }).limit(8),
      supabase.from("screening_items").select("material,division,due_at,status").order("due_at", { ascending: true }).limit(8),
      supabase.from("work_requests").select("task,target_division,due_date,status").order("due_date", { ascending: true }).limit(8),
    ]);

    const dynamicItems: SearchItem[] = [
      ...((articles.data ?? []).map((item) => ({
        id: `article:${item.slug}`,
        title: item.title,
        subtitle: item.category ? `Article - ${item.category}` : "Article",
        to: `/articles/${item.slug}`,
        icon: FileText,
      })) satisfies SearchItem[]),
      ...((team.data ?? []).map((item, index) => ({
        id: `team:${index}:${item.name}`,
        title: item.name,
        subtitle: [item.role, item.division].filter(Boolean).join(" - ") || "Team member",
        to: "/team",
        icon: Users,
      })) satisfies SearchItem[]),
      ...((events.data ?? []).map((item, index) => ({
        id: `event:${index}:${item.title}`,
        title: item.title,
        subtitle: item.event_date ? `Event - ${formatDate(item.event_date)}` : "Event",
        to: "/events",
        icon: CalendarDays,
      })) satisfies SearchItem[]),
      ...((calendar.data ?? []).map((item, index) => ({
        id: `calendar:${index}:${item.title}`,
        title: item.title,
        subtitle: item.event_date ? `Member calendar - ${formatDate(item.event_date)}` : "Member calendar",
        to: "/member/calendar",
        icon: CalendarDays,
      })) satisfies SearchItem[]),
      ...((screening.data ?? []).map((item, index) => ({
        id: `screening:${index}:${item.material}`,
        title: item.material,
        subtitle: `${item.division} screening${item.due_at ? ` - due ${formatDate(item.due_at)}` : ""}`,
        to: "/member/screening",
        icon: FileCheck2,
      })) satisfies SearchItem[]),
      ...((workRequests.data ?? []).map((item, index) => ({
        id: `work:${index}:${item.task}`,
        title: item.task,
        subtitle: `${item.target_division} request - due ${formatDate(item.due_date)}`,
        to: "/member/work-requests",
        icon: Clock3,
      })) satisfies SearchItem[]),
    ];

    setSearchItems([...baseItems, ...dynamicItems]);
  }, [navItems]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const [teamResult, evaluatorResult, assigneeResult] = await Promise.all([
      supabase.from("team_members").select("division").eq("user_id", user.id),
      supabase.from("screening_evaluators").select("division").eq("user_id", user.id),
      supabase.from("work_request_assignees").select("division").eq("user_id", user.id),
    ]);

    const userDivisions = new Set<Division>();
    for (const item of [...(teamResult.data ?? []), ...(evaluatorResult.data ?? []), ...(assigneeResult.data ?? [])]) {
      const division = normalizeDivision(item.division);
      if (division) userDivisions.add(division);
    }

    if (userDivisions.size === 0) {
      setNotifications([]);
      return;
    }

    const today = new Date();
    const deadline = new Date();
    deadline.setDate(today.getDate() + 3);
    const from = today.toISOString().slice(0, 10);
    const to = deadline.toISOString().slice(0, 10);
    const divisionList = [...userDivisions];

    const [screeningResult, workResult] = await Promise.all([
      supabase
        .from("screening_items")
        .select("id,material,division,due_at,status")
        .in("division", divisionList)
        .gte("due_at", from)
        .lte("due_at", to)
        .neq("status", "APPROVED BY INVESTMENT CLUB")
        .order("due_at", { ascending: true }),
      supabase
        .from("work_requests")
        .select("id,task,target_division,due_date,status")
        .in("target_division", divisionList)
        .gte("due_date", from)
        .lte("due_date", to)
        .not("status", "in", "(Completed,Cancelled)")
        .order("due_date", { ascending: true }),
    ]);

    const nextNotifications: DeadlineNotification[] = [
      ...((screeningResult.data ?? [])
        .filter((item) => item.due_at)
        .map((item) => ({
          id: `screening:${item.id}`,
          title: item.material,
          subtitle: `${item.division} screening is due in D-${Math.max(daysUntil(item.due_at), 0)}`,
          dueDate: item.due_at,
          to: "/member/screening",
          division: item.division,
          type: "Screening" as const,
        })) satisfies DeadlineNotification[]),
      ...((workResult.data ?? []).map((item) => ({
        id: `work:${item.id}`,
        title: item.task,
        subtitle: `${item.target_division} request is due in D-${Math.max(daysUntil(item.due_date), 0)}`,
        dueDate: item.due_date,
        to: "/member/work-requests",
        division: item.target_division,
        type: "Work request" as const,
      })) satisfies DeadlineNotification[]),
    ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    setNotifications(nextNotifications);
  }, [user]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const groupedItems = useMemo(() => ({
    navigation: searchItems.filter((item) => item.id.startsWith("nav:")),
    content: searchItems.filter((item) => !item.id.startsWith("nav:")),
  }), [searchItems]);

  const openSearch = () => {
    setSearchOpen(true);
    void loadSearchItems();
  };

  const goTo = (to: string) => {
    setSearchOpen(false);
    navigate(to);
  };

  return (
    <>
      <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-[0_16px_40px_rgba(24,24,20,0.08)] dark:bg-[#1c1b18]">
        <Button variant="ghost" size="icon" className={themeClasses.iconButton} title="Search" onClick={openSearch}>
          <Search className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className={`${themeClasses.iconButton} relative`} title="Notifications" onClick={() => void loadNotifications()}>
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 rounded-2xl border-black/5 bg-white p-2 shadow-[0_24px_60px_rgba(24,24,20,0.14)] dark:border-white/10 dark:bg-[#1c1b18]">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-[#191916] dark:text-white">Notifications</p>
              <p className="text-xs text-[#7a7972] dark:text-[#b6b3aa]">Upcoming division deadlines within D-3.</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-[#7a7972] dark:text-[#b6b3aa]">No upcoming deadlines.</div>
              ) : notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.to)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#f1f1ef] dark:hover:bg-white/10"
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f1f1ef] dark:bg-white/10">
                    {item.type === "Screening" ? <FileCheck2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#191916] dark:text-white">{item.title}</span>
                    <span className="block text-xs text-[#686760] dark:text-[#b6b3aa]">{item.subtitle}</span>
                    <span className="mt-1 inline-flex rounded-full bg-[#1d1c18] px-2 py-0.5 text-[11px] text-white dark:bg-white dark:text-[#191916]">{formatDate(item.dueDate)}</span>
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex min-w-0 items-center gap-3 rounded-full bg-white px-2 py-1.5 shadow-[0_16px_40px_rgba(24,24,20,0.08)] transition-colors hover:bg-[#fafaf8] dark:bg-[#1c1b18] dark:hover:bg-[#25231f]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7e2dc] text-sm font-semibold text-[#191916] dark:bg-white/10 dark:text-white">
              {firstName.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden min-w-0 pr-2 text-left sm:block">
              <span className="block max-w-40 truncate text-sm font-semibold text-[#191916] dark:text-white">{profile?.display_name ?? firstName}</span>
              <span className="block max-w-40 truncate text-xs text-[#7a7972] dark:text-[#b6b3aa]">{user?.email}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl border-black/5 bg-white p-2 shadow-[0_24px_60px_rgba(24,24,20,0.14)] dark:border-white/10 dark:bg-[#1c1b18]">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-[#191916] dark:text-white">{profile?.display_name ?? firstName}</p>
            <p className="truncate text-xs text-[#7a7972] dark:text-[#b6b3aa]">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <ChangePasswordDialog
            trigger={
              <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="rounded-xl">
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem onClick={handleSignOut} className="rounded-xl text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search articles, team, calendar, screening, requests..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {groupedItems.navigation.map((item) => (
              <CommandItem key={item.id} value={`${item.title} ${item.subtitle}`} onSelect={() => goTo(item.to)}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Content">
            {groupedItems.content.map((item) => (
              <CommandItem key={item.id} value={`${item.title} ${item.subtitle}`} onSelect={() => goTo(item.to)}>
                <item.icon className="mr-2 h-4 w-4" />
                <span className="min-w-0">
                  <span className="block truncate">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default WorkspaceTopbarTools;
