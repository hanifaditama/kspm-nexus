import { ReactNode } from "react";
import { Plus } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
}

const AdminCrudShell = ({ title, description, onAdd, addLabel = "Add new", children }: Props) => (
  <div>
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-[#191916] dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#686760] dark:text-[#b6b3aa]">{description}</p>}
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1d1c18] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#34322d]"
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

export default AdminCrudShell;
