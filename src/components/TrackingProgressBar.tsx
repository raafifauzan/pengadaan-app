import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrackingStep = 
  | "pengajuan" 
  | "approval" 
  | "form_evaluasi" 
  | "kelengkapan_evaluasi" 
  | "pengadaan" 
  | "pembayaran";

interface TrackingProgressBarProps {
  currentStep: TrackingStep;
  className?: string;
}

const steps: { key: TrackingStep; label: string; icon: any }[] = [
  { key: "pengajuan", label: "Pengajuan", icon: null },
  { key: "approval", label: "Approval", icon: null },
  { key: "form_evaluasi", label: "Form Evaluasi", icon: null },
  { key: "kelengkapan_evaluasi", label: "Kelengkapan Evaluasi", icon: null },
  { key: "pengadaan", label: "Pengadaan", icon: null },
  { key: "pembayaran", label: "Pembayaran", icon: null },
];

const stepOrder: TrackingStep[] = [
  "pengajuan",
  "approval",
  "form_evaluasi",
  "kelengkapan_evaluasi",
  "pengadaan",
  "pembayaran",
];

export function TrackingProgressBar({ currentStep, className }: TrackingProgressBarProps) {
  const currentIndex = stepOrder.indexOf(currentStep);
  
  return (
    <div className={cn("flex items-center justify-between w-full py-2", className)}>
      {steps.map((step, index) => {
        const stepIndex = stepOrder.indexOf(step.key);
        const isCompleted = stepIndex < currentIndex;
        const isCurrent = stepIndex === currentIndex;
        const isPending = stepIndex > currentIndex;
        const isPengajuan = step.key === "pengajuan";

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step Icon */}
            <div className="flex flex-col items-center relative z-10 min-w-[60px]">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out shadow-sm",
                  isCompleted && !isPengajuan && "bg-success text-success-foreground scale-110",
                  isCompleted && isPengajuan && "bg-primary text-primary-foreground scale-110",
                  isCurrent && "bg-primary text-primary-foreground scale-110 shadow-lg ring-2 ring-primary/20",
                  isPending && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 text-center transition-all duration-300 whitespace-nowrap",
                  isCompleted && !isPengajuan && "text-success font-medium",
                  isCompleted && isPengajuan && "text-primary font-medium",
                  isCurrent && "text-primary font-semibold",
                  isPending && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-1 relative -mt-4">
                <div className="absolute top-0 left-0 h-full w-full bg-muted/50 rounded-full" />
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-in-out",
                    stepIndex < currentIndex
                      ? "bg-primary w-full"
                      : stepIndex === currentIndex
                      ? "bg-primary w-1/2"
                      : "bg-muted w-0"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper function untuk menentukan step berdasarkan status
export function getStepFromStatus(status: string | null): TrackingStep {
  if (!status) return "pengajuan";

  const statusLower = status.toLowerCase();

  if (statusLower.includes("pembayaran") || statusLower.includes("payment")) {
    return "pembayaran";
  }
  if (statusLower.includes("pengadaan") || statusLower.includes("procurement")) {
    return "pengadaan";
  }
  if (statusLower.includes("kelengkapan") || statusLower.includes("completeness")) {
    return "kelengkapan_evaluasi";
  }
  if (statusLower.includes("evaluasi") || statusLower.includes("evaluation")) {
    return "form_evaluasi";
  }
  if (statusLower.includes("approved") || statusLower.includes("disetujui")) {
    return "approval";
  }
  if (statusLower.includes("pending") || statusLower.includes("menunggu")) {
    return "pengajuan";
  }

  // Default mapping berdasarkan status umum
  const statusMap: Record<string, TrackingStep> = {
    completed: "pembayaran",
    selesai: "pembayaran",
    in_delivery: "pengadaan",
    po_issued: "pengadaan",
    waiting_po: "kelengkapan_evaluasi",
    evaluated: "kelengkapan_evaluasi",
    pending_evaluation: "form_evaluasi",
    in_progress: "approval",
    approved: "approval",
    rejected: "pengajuan",
  };

  return statusMap[statusLower] || "pengajuan";
}

