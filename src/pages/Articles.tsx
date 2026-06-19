import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Section from "@/components/layout/Section";
import ArticleCard from "@/components/cards/ArticleCard";
import { useArticles } from "@/hooks/useContentQueries";
import { ArrowRight, ChevronDown } from "lucide-react";
import MarketTicker from "@/components/MarketTicker";
import SEO from "@/components/SEO";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const normalizeCategory = (category: string) => category.trim().toLocaleLowerCase();
const getCategory = (category?: string | null) => category?.trim() ?? "";
const getArticleCategories = (article: { category: string; categories?: string[] }) =>
  article.categories?.length ? article.categories : [article.category];

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: articles = [], isLoading: loading, error } = useArticles();

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    articles.forEach((article) => {
      getArticleCategories(article).forEach((category) => {
        const label = getCategory(category);
        if (label) unique.set(normalizeCategory(label), label);
      });
    });
    return ["All", ...Array.from(unique.values()).sort((a, b) => a.localeCompare(b))];
  }, [articles]);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? articles
        : articles.filter((article) =>
            getArticleCategories(article).some((category) => normalizeCategory(getCategory(category)) === normalizeCategory(activeCategory))
          ),
    [activeCategory, articles]
  );

  const featured = articles?.[0];

  return (
    <>
      <SEO title="Research" path="/articles" description="Explore equity research, market updates, company analysis, and investment insights created by UPH Investment Club members." />
      <MarketTicker />

      {/* Category bar - Bloomberg style */}
      <div className="sticky top-16 z-30 border-b border-[#2a4262] bg-[#102b49]">
        <div className="container flex items-center gap-0 overflow-x-auto py-0 scrollbar-hide">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={() => setActiveCategory("All")}
              className="group flex shrink-0 items-center gap-1 px-4 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:text-white"
            >
              All
              <ChevronDown className="h-3 w-3 opacity-80" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-80 min-w-52 overflow-y-auto">
              {categories.filter((cat) => cat !== "All").map((cat) => (
                <DropdownMenuItem
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat ? "font-semibold" : ""}
                >
                  {cat}
                </DropdownMenuItem>
              ))}
              {categories.length === 1 && (
                <DropdownMenuItem disabled>No categories yet</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {categories.filter((cat) => cat !== "All").map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`group flex shrink-0 items-center gap-1 px-4 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors ${
                activeCategory === cat
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
          {categories.length === 1 && (
            <span className="px-4 py-3.5 text-[13px] font-bold uppercase tracking-wide text-white/45">
              No categories yet
            </span>
          )}
        </div>
      </div>

      <h1 className="sr-only">UPH Investment Club Articles</h1>

      {error && (
        <div className="container py-6">
          <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">Articles could not be loaded.</p>
        </div>
      )}

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
                <Link to={`/articles/${featured.slug}`} className="group grid gap-8 md:grid-cols-2 md:items-center">
                  {featured.mainImage && (
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
                      <img
                        src={featured.mainImage}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                      {featured.category}
                    </span>
                    <h2 className="mt-2 max-w-3xl font-heading text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-accent md:text-4xl md:leading-tight">
                      {featured.title}
                    </h2>
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
            {activeCategory !== "All" && filtered.length === 0 && (
              <div className="rounded-md border border-dashed border-border py-12 text-center text-muted-foreground">
                No articles found in this category.
              </div>
            )}
          </Section>
        </>
      )}
    </>
  );
};

export default Articles;
