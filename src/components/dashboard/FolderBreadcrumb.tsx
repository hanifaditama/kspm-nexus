import { ChevronRight, Home } from "lucide-react";
import { MemberFolder } from "./types";

interface FolderBreadcrumbProps {
  path: MemberFolder[];
  onNavigate: (folderId: string | null) => void;
}

const FolderBreadcrumb = ({ path, onNavigate }: FolderBreadcrumbProps) => {
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Root</span>
      </button>
      {path.map((folder) => (
        <div key={folder.id} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <button
            onClick={() => onNavigate(folder.id)}
            className="rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {folder.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default FolderBreadcrumb;
