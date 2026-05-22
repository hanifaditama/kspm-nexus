import { Link } from "react-router-dom";
import { FileText, Calendar, Users, BookOpen } from "lucide-react";

const cards = [
  { to: "/admin/articles", label: "Articles", description: "Publish and edit articles", icon: FileText },
  { to: "/admin/events", label: "Events", description: "Schedule and manage events", icon: Calendar },
  { to: "/admin/team", label: "Team", description: "Manage team member profiles", icon: Users },
  { to: "/admin/programs", label: "Programs", description: "Curate program offerings", icon: BookOpen },
];

const AdminHome = () => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground">Content Management</h1>
    <p className="mt-1 text-sm text-muted-foreground">Create, edit, and delete content displayed on the public site.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/40"
          >
            <Icon className="h-6 w-6 text-accent" />
            <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-accent">{c.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
          </Link>
        );
      })}
    </div>
  </div>
);

export default AdminHome;
