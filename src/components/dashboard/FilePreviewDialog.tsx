import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MemberFile, formatFileSize } from "./types";
import { FileText, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewDialogProps {
  file: MemberFile | null;
  previewUrl: string | null;
  open: boolean;
  onClose: () => void;
  onDownload: (file: MemberFile) => void;
}

const isImage = (type: string | null) => type?.startsWith("image/");
const isPdf = (type: string | null) => type === "application/pdf";
const isText = (type: string | null) =>
  type?.startsWith("text/") || type === "application/json" || type === "application/xml";
const isVideo = (type: string | null) => type?.startsWith("video/");
const isAudio = (type: string | null) => type?.startsWith("audio/");

const FilePreviewDialog = ({ file, previewUrl, open, onClose, onDownload }: FilePreviewDialogProps) => {
  if (!file) return null;

  const canPreview = isImage(file.file_type) || isPdf(file.file_type) || isText(file.file_type) || isVideo(file.file_type) || isAudio(file.file_type);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{file.file_name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{file.file_type?.split("/")[1]?.toUpperCase() ?? "Unknown"}</span>
          <span>{formatFileSize(file.file_size)}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => onDownload(file)}>
            <Download className="mr-2 h-3 w-3" />
            Download
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-border bg-muted/30">
          {!previewUrl && (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              Loading preview...
            </div>
          )}

          {previewUrl && isImage(file.file_type) && (
            <div className="flex items-center justify-center p-4">
              <img src={previewUrl} alt={file.file_name} className="max-h-[60vh] max-w-full rounded object-contain" />
            </div>
          )}

          {previewUrl && isPdf(file.file_type) && (
            <iframe src={previewUrl} className="h-[65vh] w-full rounded" title={file.file_name} />
          )}

          {previewUrl && isVideo(file.file_type) && (
            <div className="flex items-center justify-center p-4">
              <video src={previewUrl} controls className="max-h-[60vh] max-w-full rounded" />
            </div>
          )}

          {previewUrl && isAudio(file.file_type) && (
            <div className="flex items-center justify-center p-8">
              <audio src={previewUrl} controls className="w-full max-w-md" />
            </div>
          )}

          {previewUrl && isText(file.file_type) && (
            <TextPreview url={previewUrl} />
          )}

          {previewUrl && !canPreview && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <p>Preview not available for this file type.</p>
              <Button variant="outline" onClick={() => onDownload(file)}>
                <Download className="mr-2 h-4 w-4" />
                Download to view
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);

  if (text === null) {
    fetch(url)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText("Failed to load text content."));
    return <div className="p-4 text-muted-foreground">Loading...</div>;
  }

  return (
    <pre className="whitespace-pre-wrap break-words p-4 text-sm text-foreground font-mono">
      {text}
    </pre>
  );
}

export default FilePreviewDialog;
