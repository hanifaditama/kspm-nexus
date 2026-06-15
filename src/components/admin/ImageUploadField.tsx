import { ChangeEvent, useState } from "react";
import { uploadContentImage } from "@/lib/uploadImage";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface Props {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: string;
}

const ImageUploadField = ({ value, onChange, folder }: Props) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadContentImage(file, folder);
      onChange(url);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative">
          <img src={value} alt="" className="h-16 w-16 rounded-md border border-border object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
          <Upload className="h-5 w-5" />
        </div>
      )}
      <label className="cursor-pointer rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        {uploading ? "Uploading..." : value ? "Replace" : "Upload image"}
      </label>
    </div>
  );
};

export default ImageUploadField;
