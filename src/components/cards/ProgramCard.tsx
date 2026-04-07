import type { Program } from "@/types/content";
import { BarChart3, TrendingUp, BookOpen, FileText } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  TrendingUp,
  BookOpen,
  FileText,
};

const ProgramCard = ({ program }: { program: Program }) => {
  const Icon = iconMap[program.icon] || BarChart3;

  return (
    <div className="group rounded-lg border border-border bg-card p-8 transition-all duration-300 hover:border-accent/30 hover:shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-card-foreground">{program.title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{program.description}</p>
      <ul className="space-y-2">
        {program.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgramCard;
