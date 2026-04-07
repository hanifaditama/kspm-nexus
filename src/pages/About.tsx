import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import { Target, Eye, BookOpen, Users } from "lucide-react";

const values = [
  { icon: Target, title: "Excellence", description: "We pursue the highest standards in financial education and research." },
  { icon: Eye, title: "Integrity", description: "We uphold transparency and ethical practices in all our activities." },
  { icon: BookOpen, title: "Learning", description: "We foster a culture of continuous learning and intellectual curiosity." },
  { icon: Users, title: "Community", description: "We build a supportive network of future capital market professionals." },
];

const About = () => (
  <>
    <Section>
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <SectionHeader
            label="About KSPM"
            title="Empowering the Next Generation of Market Professionals"
            description="Founded in 2012, the Capital Market Study Group (KSPM) is a student-led organization committed to advancing financial literacy and capital market education among university students."
            align="left"
          />
          <p className="text-muted-foreground leading-relaxed">
            Through hands-on workshops, investment simulations, research publications, and industry seminars, we bridge the gap between academic theory and real-world market practice. Our members gain practical skills that prepare them for careers in finance, investment banking, asset management, and beyond.
          </p>
        </div>
        <div className="rounded-lg bg-muted p-12 text-center">
          <p className="font-heading text-6xl font-semibold text-foreground">12+</p>
          <p className="mt-2 text-muted-foreground">Years of Impact</p>
        </div>
      </div>
    </Section>

    <Section variant="muted">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-2xl font-semibold text-foreground">Our Mission</h3>
          <p className="leading-relaxed text-muted-foreground">
            To cultivate a community of financially literate students equipped with the knowledge, skills, and ethical grounding to participate meaningfully in capital markets and contribute to economic development.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-2xl font-semibold text-foreground">Our Vision</h3>
          <p className="leading-relaxed text-muted-foreground">
            To become the leading student organization in capital market education, recognized for producing informed, ethical, and competent future market professionals.
          </p>
        </div>
      </div>
    </Section>

    <Section>
      <SectionHeader label="Values" title="What We Stand For" />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.title} className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <v.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{v.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{v.description}</p>
          </div>
        ))}
      </div>
    </Section>
  </>
);

export default About;
