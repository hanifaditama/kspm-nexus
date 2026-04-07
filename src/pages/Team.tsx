import { useState } from "react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import TeamCard from "@/components/cards/TeamCard";
import { team } from "@/data/mock";

const Team = () => {
  const divisions = ["All", ...Array.from(new Set(team.map((m) => m.division)))];
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? team : team.filter((m) => m.division === active);

  return (
    <Section>
      <SectionHeader label="Team" title="Meet Our Team" description="The dedicated individuals driving KSPM's mission forward." />
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {divisions.map((d) => (
          <button
            key={d}
            onClick={() => setActive(d)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m) => (
          <TeamCard key={m._id} member={m} />
        ))}
      </div>
    </Section>
  );
};

export default Team;
