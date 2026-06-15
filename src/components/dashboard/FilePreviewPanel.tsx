import { useEffect, useState } from "react";
import { Download, File, FileAudio, FileCode, FileImage, FileText, FileVideo, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberFile, formatFileSize } from "./types";

interface Props {
  file: MemberFile;
  previewUrl: string | null;
  loading: boolean;
  onClose: () => void;
  onDownload: (file: MemberFile) => void;
}

const isImage = (type: string | null) => type?.startsWith("image/");
const isPdf = (type: string | null) => type === "application/pdf";
const isText = (type: string | null) =>
  type?.startsWith("text/") || type === "application/json" || type === "application/xml" || type === "application/javascript";
const isVideo = (type: string | null) => type?.startsWith("video/");
const isAudio = (type: string | null) => type?.startsWith("audio/");

const FileIcon = ({ type }: { type: string | null }) => {
  if (isImage(type)) return <FileImage className="h-5 w-5" />;
  if (isVideo(type)) return <FileVideo className="h-5 w-5" />;
  if (isAudio(type)) return <FileAudio className="h-5 w-5" />;
  if (isText(type)) return <FileCode className="h-5 w-5" />;
  if (isPdf(type)) return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
};

const FilePreviewPanel = ({ file, previewUrl, loading, onClose, onDownload }: Props) => {
  const canPreview = isImage(file.file_type) || isPdf(file.file_type) || isText(file.file_type) || isVideo(file.file_type) || isAudio(file.file_type);
  const kind = file.file_type?.split("/")[1]?.replace(/[-_]/g, " ").toUpperCase() ?? "FILE";

  return (
    <aside className="flex min-h-[560px] flex-col overflow-hidden rounded-md border border-border bg-card lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
      <div className="flex items-start gap-3 border-b border-border px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileIcon type={file.file_type} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground" title={file.file_name}>{file.file_name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{kind} · {formatFileSize(file.file_size)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close preview"
          title="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
        {loading && <div className="flex h-full min-h-72 items-center justify-center text-sm text-muted-foreground">Loading preview...</div>}

        {!loading && previewUrl && isImage(file.file_type) && (
          <div className="flex h-full min-h-72 items-center justify-center p-4">
            <img src={previewUrl} alt={file.file_name} className="max-h-full max-w-full object-contain" />
          </div>
        )}
        {!loading && previewUrl && isPdf(file.file_type) && (
          <iframe src={previewUrl} sandbox="allow-same-origin" className="h-full min-h-[680px] w-full" title={file.file_name} />
        )}
        {!loading && previewUrl && isVideo(file.file_type) && (
          <div className="flex h-full min-h-72 items-center justify-center bg-black p-3">
            <video src={previewUrl} controls className="max-h-full max-w-full" />
          </div>
        )}
        {!loading && previewUrl && isAudio(file.file_type) && (
          <div className="flex h-full min-h-72 items-center justify-center p-6">
            <audio src={previewUrl} controls className="w-full" />
          </div>
        )}
        {!loading && previewUrl && isText(file.file_type) && <TextPreview url={previewUrl} />}

        {!loading && (!previewUrl || !canPreview) && (
          <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
            <FileIcon type={file.file_type} />
            <p className="text-sm font-medium text-foreground">Preview unavailable</p>
            <p className="max-w-xs text-xs">This format cannot be displayed directly in the browser.</p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <Button variant="outline" className="w-full" onClick={() => onDownload(file)}>
          <Download className="h-4 w-4" />
          Download
        </Button>
        <dl className="mt-3 grid grid-cols-[72px_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="text-muted-foreground">Type</dt>
          <dd className="truncate text-foreground">{file.file_type ?? "Unknown"}</dd>
          <dt className="text-muted-foreground">Uploaded</dt>
          <dd className="text-foreground">{new Date(file.created_at).toLocaleString()}</dd>
        </dl>
      </div>
    </aside>
  );
};

const TextPreview = ({ url }: { url: string }) => {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setText(null);
    fetch(url)
      .then((response) => response.text())
      .then((content) => {
        if (active) setText(content);
      })
      .catch(() => {
        if (active) setText("Failed to load text content.");
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (text === null) return <div className="p-4 text-sm text-muted-foreground">Loading text...</div>;
  return <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-6 text-foreground">{text}</pre>;
};

export default FilePreviewPanel;
