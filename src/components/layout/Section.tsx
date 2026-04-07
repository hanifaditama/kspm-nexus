import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary";
  id?: string;
}

const Section = ({ children, className, variant = "default", id }: SectionProps) => (
  <section
    id={id}
    className={cn(
      "py-20 md:py-28",
      variant === "muted" && "bg-muted",
      variant === "primary" && "bg-primary text-primary-foreground",
      className
    )}
  >
    <div className="container">{children}</div>
  </section>
);

export default Section;
