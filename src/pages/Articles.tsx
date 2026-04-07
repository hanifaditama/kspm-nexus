import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ArticleCard from "@/components/cards/ArticleCard";
import { articles } from "@/data/mock";

const Articles = () => (
  <Section>
    <SectionHeader
      label="Articles"
      title="Insights & Analysis"
      description="Read our latest articles on market trends, investment strategies, and financial education."
    />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <ArticleCard key={a._id} article={a} />
      ))}
    </div>
  </Section>
);

export default Articles;
