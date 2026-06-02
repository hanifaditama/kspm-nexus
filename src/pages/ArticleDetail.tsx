import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getArticleBySlug, getArticles } from "@/lib/content";
import { ArrowLeft, Share2 } from "lucide-react";

// ─── Portable Text renderer (Medium-style, unstyled — CSS handles it) ─────
function renderPortableText(blocks: any[]): React.ReactNode[] {
  return blocks.map((block, i) => {
    if (block._type !== "block") return null;
    const children = (block.children ?? []).map((span: any, j: number) => {
      let text: React.ReactNode = span.text;
      if (span.marks?.includes("strong")) text = <strong key={j}>{text}</strong>;
      if (span.marks?.includes("em")) text = <em key={j}>{text}</em>;
      return text;
    });
    switch (block.style) {
      case "h2": return <h2 key={i}>{children}</h2>;
      case "h3": return <h3 key={i}>{children}</h3>;
      case "blockquote": return <blockquote key={i}>{children}</blockquote>;
      default: return <p key={i}>{children}</p>;
    }
  });
}

function renderPlainText(content: string): React.ReactNode[] {
  return content.split("\n\n").map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) return <h2 key={i}>{trimmed.replace(/^##\s+/, "")}</h2>;
    if (trimmed.startsWith("### ")) return <h3 key={i}>{trimmed.replace(/^###\s+/, "")}</h3>;
    if (trimmed.startsWith("> ")) return <blockquote key={i}>{trimmed.replace(/^>\s+/, "")}</blockquote>;
    return <p key={i}>{trimmed}</p>;
  });
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    // Load the article first so the page renders ASAP.
    getArticleBySlug(slug).then((art) => {
      if (cancelled) return;
      setArticle(art ?? null);
      setLoading(false);
    });
    // Load related articles in the background — don't block render.
    getArticles().then((all) => {
      if (cancelled) return;
      setRelated((all as any[]).filter((a) => a.slug !== slug).slice(0, 3));
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[728px] animate-pulse space-y-4 px-6 py-24">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-muted" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

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

  const content = article.content;
  const isPortableText = Array.isArray(content);
  const wordCount = isPortableText
    ? content.flatMap((b: any) => b.children?.map((s: any) => s.text) ?? []).join(" ").split(/\s+/).length
    : typeof content === "string"
    ? content.split(/\s+/).length
    : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const initials = article.author?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "?";
  const publishedLabel = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <article className="bg-white pb-24">
      {/* Top bar */}
      <div className="border-b border-[#f2f2f2]">
        <div className="mx-auto flex max-w-[1192px] items-center justify-between px-6 py-3">
          <Link to="/articles" className="flex items-center gap-2 text-sm text-[#6b6b6b] transition-colors hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Articles
          </Link>
          <button className="flex items-center gap-2 text-sm text-[#6b6b6b] transition-colors hover:text-black">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-[728px] px-6 pt-12 md:pt-16">
        <h1 className="article-title text-[2.5rem] md:text-[3.25rem]">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="article-subtitle mt-4 text-xl md:text-2xl">
            {article.excerpt}
          </p>
        )}

        {/* Author row */}
        <div className="mt-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-sm font-semibold text-[#242424]">
            {initials}
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-medium text-[#242424]">{article.author?.name ?? "Unknown"}</p>
            <div className="flex items-center gap-2 text-[13px] text-[#6b6b6b]">
              <span>{readTime} min read</span>
              <span>·</span>
              <span>{publishedLabel}</span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-6 flex items-center justify-between border-y border-[#f2f2f2] py-2 text-[#6b6b6b]">
          <span className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#242424]">
            {article.category}
          </span>
          <button className="flex items-center gap-2 text-sm hover:text-black">
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* Cover image */}
      {article.mainImage && (
        <figure className="mx-auto mt-10 max-w-[1000px] px-0 md:px-6">
          <img
            src={article.mainImage}
            alt={article.title}
            className="h-auto w-full object-cover"
          />
        </figure>
      )}

      {/* Body */}
      <div className="mx-auto mt-10 max-w-[728px] px-6">
        <div className="article-medium">
          {!content && <p>Full article content coming soon.</p>}
          {content && isPortableText && renderPortableText(content)}
          {content && !isPortableText && renderPlainText(content as string)}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <aside className="mx-auto mt-20 max-w-[728px] border-t border-[#f2f2f2] px-6 pt-10">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-[#6b6b6b]">
            More from this publication
          </h3>
          <div className="space-y-5">
            {related.map((a) => (
              <Link key={a._id} to={`/articles/${a.slug}`} className="group block">
                <span className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">{a.category}</span>
                <h4 className="article-title mt-1 text-lg group-hover:underline">{a.title}</h4>
                <p className="mt-1 text-sm text-[#6b6b6b]">
                  {new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </article>
  );
};

export default ArticleDetail;
