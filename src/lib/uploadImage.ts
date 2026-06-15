import { supabase } from "@/integrations/supabase/client";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadContentImage(file: File, folder: string): Promise<string> {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Please select a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Images must be 5 MB or smaller.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("content-images").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("content-images").getPublicUrl(path);
  return data.publicUrl;
}
