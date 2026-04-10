import { Link } from "react-router-dom";
import type { Article } from "@/types/content";
import { ArrowUpRight } from "lucide-react";

const ArticleCard = ({ article }: { article: Article }) => (
  <Link to={`/articles/${article.slug}`} className="group">
    <article className="flex flex-col rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-sm h-full">
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
    </article>
  </Link>
);

export default ArticleCard;
