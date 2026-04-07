import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ProgramCard from "@/components/cards/ProgramCard";
import { programs } from "@/data/mock";

const Programs = () => (
  <Section>
    <SectionHeader
      label="Programs"
      title="Our Programs"
      description="Explore our comprehensive programs designed to build expertise in capital markets, from beginner to advanced levels."
    />
    <div className="grid gap-6 md:grid-cols-2">
      {programs.map((p) => (
        <ProgramCard key={p._id} program={p} />
      ))}
    </div>
  </Section>
);

export default Programs;
