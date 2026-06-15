import DOMPurify from "dompurify";

const allowedProtocols = new Set(["http:", "https:", "mailto:"]);

export function normalizeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin);
    return allowedProtocols.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h2", "h3", "blockquote",
      "ul", "ol", "li", "a", "img", "hr", "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "style"],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/|#)/i,
  });
}
