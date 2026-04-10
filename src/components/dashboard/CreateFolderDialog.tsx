import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlus } from "lucide-react";

interface CreateFolderDialogProps {
  onCreateFolder: (name: string) => Promise<void>;
}

const CreateFolderDialog = ({ onCreateFolder }: CreateFolderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    setCreating(true);
    await onCreateFolder(folderName.trim());
    setFolderName("");
    setCreating(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!folderName.trim() || creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
