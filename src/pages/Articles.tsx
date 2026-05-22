import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Section from "@/components/layout/Section";
import ArticleCard from "@/components/cards/ArticleCard";
import { getArticles } from "@/lib/content";
import { ArrowRight, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";

const categories = ["All", "Market Analysis", "Economics", "Sustainable Finance", "Commodities", "Stocks"];

const marketData = [
  { name: "S&P 500", value: "6,775.38", change: "+2.40%", up: true },
  { name: "Nasdaq", value: "22,604.66", change: "+2.68%", up: true },
  { name: "B500", value: "2,438.49", change: "+2.20%", up: true },
  { name: "US 10 Yr", value: "4.27", change: "0.00%", up: true },
  { name: "Crude Oil", value: "94.55", change: "-16.29%", up: false },
  { name: "FTSE 100", value: "8,275.66", change: "+1.15%", up: true },
  { name: "Gold", value: "2,341.50", change: "+0.82%", up: true },
];

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? articles
        : articles.filter((a) => a.category === activeCategory),
    [activeCategory, articles]
  );

  const featured = articles?.[0];

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

      {/* Market ticker bar */}
      <div className="border-b border-border bg-primary">
        <div className="container flex flex-wrap items-center gap-2 py-2">
          <div className="flex shrink-0 items-center gap-1.5 pr-3 text-sm font-medium text-primary-foreground">
            Top Securities
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
          {marketData.map((item) => (
            <div
              key={item.name}
              className="flex shrink-0 items-center gap-2 rounded-md bg-primary-foreground/10 px-3 py-1.5"
            >
              <span className="text-xs font-semibold text-primary-foreground">{item.name}</span>
              <span className="text-xs text-primary-foreground/80">{item.value}</span>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  item.up ? "text-green-400" : "text-red-400"
                }`}
              >
                {item.up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {item.change}
              </span>
            </div>
          ))}
        </div>
        <div className="container pb-2">
          <span className="text-[0.65rem] italic text-primary-foreground/50">
            Updated after market close
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <Section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-muted" />
            ))}
          </div>
        </Section>
      )}

      {/* Empty state */}
      {!loading && articles.length === 0 && (
        <Section>
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">No articles published yet.</p>
            <p className="mt-1 text-sm">Check back soon or add articles from the admin panel.</p>
          </div>
        </Section>
      )}

      {/* Content */}
      {!loading && articles.length > 0 && (
        <>
          {/* Featured article */}
          {activeCategory === "All" && featured && (
            <div className="border-b border-border">
              <div className="container py-10 md:py-14">
                <Link to={`/articles/${featured.slug}`} className="group block">
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {featured.category}
                  </span>
                  <h1 className="mt-2 max-w-3xl font-heading text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-accent md:text-4xl md:leading-tight">
                    {featured.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                    {featured.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {featured.author?.name}
                    </span>
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
              <span className="text-sm text-muted-foreground">
                {filtered.length} articles
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(activeCategory === "All" ? filtered.slice(1) : filtered).map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          </Section>
        </>
      )}
    </>
  );
};

export default Articles;
