import { Link } from "react-router-dom";
import type { Article } from "@/types/content";
import { ArrowUpRight } from "lucide-react";

const ArticleCard = ({ article }: { article: Article }) => (
  <Link to={`/articles/${article.slug}`} className="group">
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-accent/30 hover:shadow-sm">
      {article.mainImage && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={article.mainImage}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-3 text-xs font-medium uppercase tracking-wider text-accent">{article.category}</span>
        <h3 className="mb-2 text-lg font-semibold leading-snug text-card-foreground transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{article.author?.name || "Unknown Author"}</span>
          <div className="flex items-center gap-1">
            <span>{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </article>
  </Link>
);

export default ArticleCard;
