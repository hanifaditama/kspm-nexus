import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";

const WorkspaceThemeSwitch = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem("uphic-theme") as ThemeMode) || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("uphic-theme", theme);
  }, [theme]);

  return (
    <div className="grid gap-1 rounded-full bg-white p-1.5 shadow-[0_16px_40px_rgba(24,24,20,0.08)] dark:bg-[#1c1b18]">
      <button
        className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
          theme === "light"
            ? "bg-[#1d1c18] text-white dark:bg-white dark:text-[#191916]"
            : "text-[#5e5d57] hover:bg-[#f1f1ef] dark:text-[#c9c7bd] dark:hover:bg-white/10"
        }`}
        title="Light mode"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
          theme === "dark"
            ? "bg-[#1d1c18] text-white dark:bg-white dark:text-[#191916]"
            : "text-[#5e5d57] hover:bg-[#f1f1ef] dark:text-[#c9c7bd] dark:hover:bg-white/10"
        }`}
        title="Dark mode"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default WorkspaceThemeSwitch;
