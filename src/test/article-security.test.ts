import { describe, expect, it } from "vitest";
import { normalizeExternalUrl, sanitizeArticleHtml } from "@/lib/articleSecurity";

describe("article security", () => {
  it("removes executable article content", () => {
    const sanitized = sanitizeArticleHtml(
      '<p onclick="alert(1)">Safe</p><script>alert(1)</script><a href="javascript:alert(1)">Bad</a>',
    );

    expect(sanitized).toContain("<p>Safe</p>");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("<script");
    expect(sanitized).not.toContain("javascript:");
  });

  it("allows only expected editor link protocols", () => {
    expect(normalizeExternalUrl("https://example.com")).toBe("https://example.com/");
    expect(normalizeExternalUrl("mailto:investment.club@uph.edu")).toBe("mailto:investment.club@uph.edu");
    expect(normalizeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeExternalUrl("data:text/html,bad")).toBeNull();
  });
});
