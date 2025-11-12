import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

const views = [
  { label: "Form Evaluasi", path: "/evaluasi" },
  { label: "Progres Dokumen", path: "/evaluasi/progres" },
] as const;

export function EvaluationViewToggle() {
  const location = useLocation();

  return (
    <div className="inline-flex items-center rounded-full bg-muted p-1 text-sm font-medium">
      {views.map((view) => {
        const isActive = location.pathname === view.path;
        return (
          <Link
            key={view.path}
            to={view.path}
            className={cn(
              "px-4 py-1.5 rounded-full transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}
