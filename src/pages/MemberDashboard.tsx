import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LogOut, Upload, FileText, Trash2, Download, FolderOpen, Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MemberFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  uploaded_by: string;
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const MemberDashboard = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<MemberFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase
      .from("member_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setFiles(data);
    setLoadingFiles(false);
  }, []);

  useEffect(() => {
    if (user) fetchFiles();
  }, [user, fetchFiles]);

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
    });

    if (dbError) {
      toast({ title: "Error", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "File uploaded successfully" });
      fetchFiles();
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

  const handleDelete = async (file: MemberFile) => {
    if (file.uploaded_by !== user?.id) return;

    await supabase.storage.from("member-files").remove([file.file_path]);
    const { error } = await supabase.from("member_files").delete().eq("id", file.id);

    if (!error) {
      toast({ title: "File deleted" });
      fetchFiles();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const filtered = files.filter((f) =>
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
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Member Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {profile?.display_name ?? user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profile?.can_upload && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
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

      {/* Files */}
      <div className="container py-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loadingFiles ? (
          <div className="py-20 text-center text-muted-foreground">Loading files...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No files found</p>
          </div>
        ) : (
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
                {filtered.map((file) => (
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
                          onClick={() => handleDownload(file)}
                          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {file.uploaded_by === user.id && (
                          <button
                            onClick={() => handleDelete(file)}
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
        )}
      </div>
    </section>
  );
};

export default MemberDashboard;
