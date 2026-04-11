import type { TeamMember } from "@/types/content";
import { Linkedin, User } from "lucide-react";
import { urlFor } from "@/lib/sanity";

const TeamCard = ({ member }: { member: TeamMember }) => (
  <div className="group rounded-lg border border-border bg-card p-6 text-center transition-all duration-300 hover:border-accent/30 hover:shadow-sm">
    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className="h-8 w-8" />
      )}
    </div>
    <h3 className="text-base font-semibold text-card-foreground">{member.name}</h3>
    <p className="mt-1 text-sm text-accent">{member.role}</p>
    <p className="mt-0.5 text-xs text-muted-foreground">{member.division}</p>
    {member.linkedin && (
      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-accent">
        <Linkedin className="h-3.5 w-3.5" />
        LinkedIn
      </a>
    )}
  </div>
);

export default TeamCard;
