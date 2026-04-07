import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

const SectionHeader = ({ label, title, description, className, align = "center" }: SectionHeaderProps) => (
  <div className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
    {label && (
      <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">
        {label}
      </span>
    )}
    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
    {description && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>}
  </div>
);

export default SectionHeader;
