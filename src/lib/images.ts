const PUBLIC_STORAGE_PATH = "/storage/v1/object/public/";
const RENDER_STORAGE_PATH = "/storage/v1/render/image/public/";

export const optimizedImageUrl = (source: string, width: number, quality = 72) => {
  if (!source.includes(PUBLIC_STORAGE_PATH)) return source;

  const url = new URL(source);
  url.pathname = url.pathname.replace(PUBLIC_STORAGE_PATH, RENDER_STORAGE_PATH);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", String(quality));
  url.searchParams.set("format", "webp");
  return url.toString();
};

export const optimizedImageSrcSet = (source: string, widths: number[], quality = 72) =>
  source.includes(PUBLIC_STORAGE_PATH)
    ? widths.map((width) => `${optimizedImageUrl(source, width, quality)} ${width}w`).join(", ")
    : undefined;
