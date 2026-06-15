import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
  headingLevel?: "h1" | "h2";
}

const SectionHeader = ({ label, title, description, className, align = "center", headingLevel = "h2" }: SectionHeaderProps) => {
  const Heading = headingLevel;
  return (
    <header className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {label && (
        <span className="mb-3 inline-block text-sm font-medium uppercase tracking-widest text-accent">
          {label}
        </span>
      )}
      <Heading className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</Heading>
      {description && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>}
    </header>
  );
};

export default SectionHeader;
