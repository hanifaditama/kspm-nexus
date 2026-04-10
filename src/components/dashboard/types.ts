export interface MemberFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  uploaded_by: string;
  folder_id: string | null;
}

export interface MemberFolder {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
}

export const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};
