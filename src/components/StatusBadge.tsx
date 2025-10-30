import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProcurementStatus = "pending" | "approved" | "rejected" | "in_progress" | "completed" | "pending_evaluation" | "evaluated";

interface StatusBadgeProps {
  status: ProcurementStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
  },
  approved: {
    label: "Disetujui",
    className: "bg-success/10 text-success hover:bg-success/20 border-success/20",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
  },
  in_progress: {
    label: "Dalam Proses",
    className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
  },
  completed: {
    label: "Selesai",
    className: "bg-success/10 text-success hover:bg-success/20 border-success/20",
  },
  pending_evaluation: {
    label: "Menunggu Evaluasi",
    className: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
  },
  evaluated: {
    label: "Sudah Dievaluasi",
    className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="outline"
      className={cn(config.className, "font-medium", className)}
    >
      {config.label}
    </Badge>
  );
};
