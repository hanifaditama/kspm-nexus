import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const SITE_NAME = "UPH Investment Club";
const SITE_URL = "https://investmentclubuph.vercel.app";
const DEFAULT_DESCRIPTION = "UPH Investment Club is a student-led investment and capital market community focused on equity research, financial education, market discussion, and investment-related activities.";
const KEYWORDS = "UPH Investment Club, UPHIC, investment club, equity research, capital market, stock market, finance student organization, Universitas Pelita Harapan, student investment community";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const absoluteUrl = (path: string) => path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = "/og-image.png",
  type = "website",
  noIndex = false,
  jsonLd,
}: SEOProps) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  useEffect(() => {
    document.head.querySelectorAll("[data-static-seo]").forEach((element) => element.remove());
  }, []);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={KEYWORDS} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} social preview`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL };
export default SEO;
