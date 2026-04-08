import { useParams, Link } from "react-router-dom";
import { articles } from "@/data/mock";
import { ArrowLeft, Clock, Share2 } from "lucide-react";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Article not found</h1>
        <Link to="/articles" className="mt-4 inline-block text-sm text-accent hover:text-accent/80">
          ← Back to Articles
        </Link>
      </div>
    );
  }

  const readTime = article.content ? Math.ceil(article.content.split(/\s+/).length / 200) : 3;

  const renderContent = (content: string) => {
    return content.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2 key={i} className="mt-10 mb-4 font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {block.replace("## ", "")}
          </h2>
        );
      }
      return (
        <p key={i} className="mb-5 text-base leading-[1.8] text-foreground/85 md:text-[1.0625rem] md:leading-[1.85]">
          {block}
        </p>
      );
    });
  };

  return (
    <article className="pb-20">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-3">
          <Link to="/articles" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Articles
          </Link>
          <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-10 md:py-16">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
            {article.category}
          </span>
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground md:text-[2.5rem] md:leading-[1.15]">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            {article.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-4 border-t border-border pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
              {article.author.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{article.author.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <div className="font-sans">
          {article.content ? renderContent(article.content) : (
            <p className="text-base leading-[1.8] text-foreground/85">Full article content coming soon.</p>
          )}
        </div>
      </div>

      {/* Related articles */}
      <aside className="mx-auto mt-16 max-w-3xl border-t border-border px-6 pt-10">
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">More Articles</h3>
        <div className="space-y-4">
          {articles
            .filter((a) => a._id !== article._id)
            .slice(0, 3)
            .map((a) => (
              <Link
                key={a._id}
                to={`/articles/${a.slug}`}
                className="group flex items-start gap-4 py-3 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">{a.category}</span>
                  <h4 className="mt-1 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
                    {a.title}
                  </h4>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))}
        </div>
      </aside>
    </article>
  );
};

export default ArticleDetail;
