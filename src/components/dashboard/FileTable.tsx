import { FileText, Download, Trash2, Folder, FolderOpen } from "lucide-react";
import { MemberFile, MemberFolder, formatFileSize } from "./types";

interface FileTableProps {
  folders: MemberFolder[];
  files: MemberFile[];
  userId: string;
  onOpenFolder: (folderId: string) => void;
  onDownload: (file: MemberFile) => void;
  onDeleteFile: (file: MemberFile) => void;
  onDeleteFolder: (folder: MemberFolder) => void;
}

const FileTable = ({
  folders,
  files,
  userId,
  onOpenFolder,
  onDownload,
  onDeleteFile,
  onDeleteFolder,
}: FileTableProps) => {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">No files or folders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Type</th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Size</th>
            <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Date</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <tr
              key={`folder-${folder.id}`}
              className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
              onDoubleClick={() => onOpenFolder(folder.id)}
            >
              <td className="px-4 py-3">
                <button
                  onClick={() => onOpenFolder(folder.id)}
                  className="flex items-center gap-3 text-left"
                >
                  <Folder className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate font-medium text-foreground">{folder.name}</span>
                </button>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">Folder</td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">—</td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {new Date(folder.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {folder.user_id === userId && (
                    <button
                      onClick={() => onDeleteFolder(folder)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete folder"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {files.map((file) => (
            <tr key={file.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">{file.file_name}</span>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {file.file_type?.split("/")[1]?.toUpperCase() ?? "—"}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {formatFileSize(file.file_size)}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {new Date(file.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onDownload(file)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {file.uploaded_by === userId && (
                    <button
                      onClick={() => onDeleteFile(file)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileTable;
