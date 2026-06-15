import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, FileCheck2, LogOut, Upload, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MemberFile, MemberFolder } from "@/components/dashboard/types";
import FolderBreadcrumb from "@/components/dashboard/FolderBreadcrumb";
import CreateFolderDialog from "@/components/dashboard/CreateFolderDialog";
import FileTable from "@/components/dashboard/FileTable";
import FilePreviewPanel from "@/components/dashboard/FilePreviewPanel";
import ChangePasswordDialog from "@/components/dashboard/ChangePasswordDialog";

const allowedMemberFileTypes = new Set([
  "application/pdf",
  "application/json",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "text/csv",
  "text/plain",
  "video/mp4",
  "video/webm",
]);

const MemberDashboard = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
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
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestRef = useRef(0);

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
      .select("id,name,user_id,parent_id,created_at")
      .order("name", { ascending: true });
    if (currentFolderId) {
      folderQuery.eq("parent_id", currentFolderId);
    } else {
      folderQuery.is("parent_id", null);
    }

    const fileQuery = supabase
      .from("member_files")
      .select("id,file_name,file_path,file_size,file_type,uploaded_by,folder_id,created_at")
      .order("created_at", { ascending: false });
    if (currentFolderId) {
      fileQuery.eq("folder_id", currentFolderId);
    } else {
      fileQuery.is("folder_id", null);
    }

    const [foldersRes, filesRes] = await Promise.all([folderQuery, fileQuery]);
    if (foldersRes.data) setFolders(foldersRes.data);
    if (filesRes.data) setFiles(filesRes.data);
    const error = foldersRes.error ?? filesRes.error;
    if (error) {
      toast({ title: "Could not load files", description: error.message, variant: "destructive" });
    }
    setLoadingFiles(false);
  }, [currentFolderId, toast]);

  useEffect(() => {
    if (user) {
      fetchContents();
      buildFolderPath(currentFolderId);
    }
  }, [user, fetchContents, buildFolderPath, currentFolderId]);

  const handleNavigateFolder = (folderId: string | null) => {
    handleClosePreview();
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
    if (!confirm(`Delete folder "${folder.name}"?`)) return;
    const { error } = await supabase.from("member_folders").delete().eq("id", folder.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Folder deleted" });
    setFolders((current) => current.filter((item) => item.id !== folder.id));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!allowedMemberFileTypes.has(file.type)) {
      toast({ title: "File type is not allowed", description: "Upload documents, PDF, text, spreadsheet, presentation, safe image, audio, or video files.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "File is too large", description: "Uploads must be 25 MB or smaller.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${Date.now()}_${safeName}`;

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
      await supabase.storage.from("member-files").remove([filePath]);
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
    const requestId = ++previewRequestRef.current;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(file);
    setPreviewUrl(null);
    setPreviewLoading(true);

    const { data, error } = await supabase.storage
      .from("member-files")
      .download(file.file_path);

    if (error || !data) {
      if (requestId !== previewRequestRef.current) return;
      toast({ title: "Failed to load preview", variant: "destructive" });
      setPreviewLoading(false);
      return;
    }

    const url = URL.createObjectURL(data);
    if (requestId !== previewRequestRef.current) {
      URL.revokeObjectURL(url);
      return;
    }
    setPreviewUrl(url);
    setPreviewLoading(false);
  };

  const handleClosePreview = () => {
    previewRequestRef.current += 1;
    setPreviewLoading(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewFile(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDelete = async (file: MemberFile) => {
    if (file.uploaded_by !== user?.id) return;
    if (!confirm(`Delete "${file.file_name}"?`)) return;
    const { error: storageError } = await supabase.storage.from("member-files").remove([file.file_path]);
    if (storageError) {
      toast({ title: "Delete failed", description: storageError.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("member_files").delete().eq("id", file.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "File deleted" });
    setFiles((current) => current.filter((item) => item.id !== file.id));
    if (previewFile?.id === file.id) handleClosePreview();
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Sign out failed", description: error, variant: "destructive" });
    }
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
        <div className="container flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Member Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {profile?.display_name ?? user.email}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link to="/member/calendar">
                <CalendarDays className="mr-2 h-4 w-4" />
                Calendar
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/member/screening">
                <FileCheck2 className="mr-2 h-4 w-4" />
                Screening
              </Link>
            </Button>
            <CreateFolderDialog onCreateFolder={handleCreateFolder} />
            <ChangePasswordDialog />
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

        <div className={previewFile ? "grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,42%)]" : ""}>
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
              selectedFileId={previewFile?.id}
            />
          )}
          {previewFile && (
            <FilePreviewPanel
              file={previewFile}
              previewUrl={previewUrl}
              loading={previewLoading}
              onClose={handleClosePreview}
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default MemberDashboard;
