import { useState, useEffect } from "react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import TeamCard from "@/components/cards/TeamCard";
import { getTeam } from "@/lib/content";

const Team = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");

  useEffect(() => {
    getTeam()
      .then(setTeam)
      .finally(() => setLoading(false));
  }, []);

  const divisions = ["All", ...Array.from(new Set(team.map((m) => m.division).filter(Boolean)))];
  const filtered = active === "All" ? team : team.filter((m) => m.division === active);

  return (
    <Section>
      <SectionHeader
        label="Team"
        title="Meet Our Team"
        description="The dedicated individuals driving KSPM's mission forward."
      />

      {!loading && team.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {divisions.map((d) => (
            <button
              key={d}
              onClick={() => setActive(d)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      )}

      {!loading && team.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No team members added yet.</p>
          <p className="mt-1 text-sm">Add team members from the admin panel.</p>
        </div>
      )}

      {!loading && team.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <TeamCard key={m._id} member={m} />
          ))}
        </div>
      )}
    </Section>
  );
};

export default Team;
