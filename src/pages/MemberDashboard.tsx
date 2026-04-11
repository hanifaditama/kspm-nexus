import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Upload, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MemberFile, MemberFolder } from "@/components/dashboard/types";
import FolderBreadcrumb from "@/components/dashboard/FolderBreadcrumb";
import CreateFolderDialog from "@/components/dashboard/CreateFolderDialog";
import FileTable from "@/components/dashboard/FileTable";
import FilePreviewDialog from "@/components/dashboard/FilePreviewDialog";

const MemberDashboard = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<MemberFile[]>([]);
  const [folders, setFolders] = useState<MemberFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<MemberFolder[]>([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [previewFile, setPreviewFile] = useState<MemberFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const buildFolderPath = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      setFolderPath([]);
      return;
    }
    const path: MemberFolder[] = [];
    let currentId: string | null = folderId;
    while (currentId) {
      const { data } = await supabase
        .from("member_folders")
        .select("*")
        .eq("id", currentId)
        .single();
      if (data) {
        path.unshift(data);
        currentId = data.parent_id;
      } else {
        break;
      }
    }
    setFolderPath(path);
  }, []);

  const fetchContents = useCallback(async () => {
    setLoadingFiles(true);

    const folderQuery = supabase
      .from("member_folders")
      .select("*")
      .order("name", { ascending: true });
    if (currentFolderId) {
      folderQuery.eq("parent_id", currentFolderId);
    } else {
      folderQuery.is("parent_id", null);
    }

    const fileQuery = supabase
      .from("member_files")
      .select("*")
      .order("created_at", { ascending: false });
    if (currentFolderId) {
      fileQuery.eq("folder_id", currentFolderId);
    } else {
      fileQuery.is("folder_id", null);
    }

    const [foldersRes, filesRes] = await Promise.all([folderQuery, fileQuery]);
    if (foldersRes.data) setFolders(foldersRes.data);
    if (filesRes.data) setFiles(filesRes.data);
    setLoadingFiles(false);
  }, [currentFolderId]);

  useEffect(() => {
    if (user) {
      fetchContents();
      buildFolderPath(currentFolderId);
    }
  }, [user, fetchContents, buildFolderPath, currentFolderId]);

  const handleNavigateFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSearch("");
  };

  const handleCreateFolder = async (name: string) => {
    if (!user) return;
    const { error } = await supabase.from("member_folders").insert({
      name,
      user_id: user.id,
      parent_id: currentFolderId,
    });
    if (error) {
      toast({ title: "Error creating folder", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Folder created" });
      fetchContents();
    }
  };

  const handleDeleteFolder = async (folder: MemberFolder) => {
    if (folder.user_id !== user?.id) return;
    const { error } = await supabase.from("member_folders").delete().eq("id", folder.id);
    if (!error) {
      toast({ title: "Folder deleted" });
      fetchContents();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("member-files")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("member_files").insert({
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      uploaded_by: user.id,
      folder_id: currentFolderId,
    });

    if (dbError) {
      toast({ title: "Error", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "File uploaded successfully" });
      fetchContents();
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDownload = async (file: MemberFile) => {
    const { data, error } = await supabase.storage
      .from("member-files")
      .download(file.file_path);
    if (error || !data) {
      toast({ title: "Download failed", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = async (file: MemberFile) => {
    setPreviewFile(file);
    setPreviewUrl(null);
    setPreviewOpen(true);

    const { data, error } = await supabase.storage
      .from("member-files")
      .download(file.file_path);

    if (error || !data) {
      toast({ title: "Failed to load preview", variant: "destructive" });
      setPreviewOpen(false);
      return;
    }

    const url = URL.createObjectURL(data);
    setPreviewUrl(url);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewFile(null);
  };

  const handleDelete = async (file: MemberFile) => {
    if (file.uploaded_by !== user?.id) return;
    await supabase.storage.from("member-files").remove([file.file_path]);
    const { error } = await supabase.from("member_files").delete().eq("id", file.id);
    if (!error) {
      toast({ title: "File deleted" });
      fetchContents();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFiles = files.filter((f) =>
    f.file_name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Member Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {profile?.display_name ?? user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CreateFolderDialog onCreateFolder={handleCreateFolder} />
            {profile?.can_upload && (
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                <span className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload File"}
                </span>
              </label>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-4">
          <FolderBreadcrumb path={folderPath} onNavigate={handleNavigateFolder} />
        </div>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loadingFiles ? (
          <div className="py-20 text-center text-muted-foreground">Loading...</div>
        ) : (
          <FileTable
            folders={filteredFolders}
            files={filteredFiles}
            userId={user.id}
            onOpenFolder={handleNavigateFolder}
            onDownload={handleDownload}
            onPreview={handlePreview}
            onDeleteFile={handleDelete}
            onDeleteFolder={handleDeleteFolder}
          />
        )}
      </div>

      <FilePreviewDialog
        file={previewFile}
        previewUrl={previewUrl}
        open={previewOpen}
        onClose={handleClosePreview}
        onDownload={handleDownload}
      />
    </section>
  );
};

export default MemberDashboard;
