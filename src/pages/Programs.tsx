import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ProgramCard from "@/components/cards/ProgramCard";
import { usePrograms } from "@/hooks/useContentQueries";

const Programs = () => {
  const { data: programs = [], isLoading: loading, error } = usePrograms();

  return (
    <Section>
      <SectionHeader
        label="Programs"
        title="Our Programs"
        description="Explore our comprehensive programs designed to build expertise in capital markets, from beginner to advanced levels."
      />
      {error && <p className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">Programs could not be loaded.</p>}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No programs yet.</p>
          <p className="mt-1 text-sm">Add programs from the admin panel.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <ProgramCard key={p._id} program={p} />
          ))}
        </div>
      )}
    </Section>
  );
};

export default Programs;
