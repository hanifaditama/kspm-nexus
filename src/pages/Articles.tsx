import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Section from "@/components/layout/Section";
import ArticleCard from "@/components/cards/ArticleCard";
import { articles } from "@/data/mock";
import { ArrowRight } from "lucide-react";

const categories = ["All", "Market Analysis", "Economics", "Sustainable Finance", "Commodities", "Stocks"];

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(
    () => (activeCategory === "All" ? articles : articles.filter((a) => a.category === activeCategory)),
    [activeCategory]
  );

  // Featured article (latest)
  const featured = articles[0];

  return (
    <>
      {/* Category bar */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center gap-1 overflow-x-auto py-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured article */}
      {activeCategory === "All" && (
        <div className="border-b border-border">
          <div className="container py-10 md:py-14">
            <Link to={`/articles/${featured.slug}`} className="group block">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">{featured.category}</span>
              <h1 className="mt-2 max-w-3xl font-heading text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-accent md:text-4xl md:leading-tight">
                {featured.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {featured.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{featured.author.name}</span>
                <span>·</span>
                <span>
                  {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <ArrowRight className="ml-2 h-4 w-4 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Articles grid */}
      <Section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {activeCategory === "All" ? "Latest Articles" : activeCategory}
          </h2>
          <span className="text-sm text-muted-foreground">{filtered.length} articles</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(activeCategory === "All" ? filtered.slice(1) : filtered).map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      </Section>
    </>
  );
};

export default Articles;
