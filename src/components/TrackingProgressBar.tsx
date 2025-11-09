import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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
  isRejected?: boolean;
}

type StepConfig = { key: TrackingStep; label: string; icon?: LucideIcon | null };

const steps: StepConfig[] = [
  { key: "pengajuan", label: "Pengajuan" },
  { key: "approval", label: "Approval" },
  { key: "form_evaluasi", label: "Form Evaluasi" },
  { key: "kelengkapan_evaluasi", label: "Dokumen Evaluasi" },
  { key: "pengadaan", label: "Pengadaan" },
  { key: "pembayaran", label: "Pembayaran" },
];

const stepOrder: TrackingStep[] = [
  "pengajuan",
  "approval",
  "form_evaluasi",
  "kelengkapan_evaluasi",
  "pengadaan",
  "pembayaran",
];

export function TrackingProgressBar({ currentStep, className, isRejected = false }: TrackingProgressBarProps) {
  const currentIndex = stepOrder.indexOf(currentStep);
  
  return (
    <div className={cn("flex items-center w-full gap-3 py-3", className)}>
      {steps.map((step, index) => {
        const stepIndex = stepOrder.indexOf(step.key);
        const isCompleted = stepIndex < currentIndex;
        const isCurrent = stepIndex === currentIndex;
        const isPending = stepIndex > currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-[80px]">
            <div className="flex flex-col items-center text-center min-w-[74px] gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out shadow-sm",
                  isCompleted && !isRejected && "bg-primary text-primary-foreground scale-110",
                  isCompleted && isRejected && "bg-destructive text-destructive-foreground scale-110",
                  isCurrent && !isRejected && "bg-primary text-primary-foreground scale-110 shadow-lg ring-2 ring-primary/20",
                  isCurrent && isRejected && "bg-destructive text-destructive-foreground scale-110 shadow-lg ring-2 ring-destructive/30",
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
              <p
                className={cn(
                  "text-[10px] leading-tight text-center transition-all duration-300 whitespace-nowrap font-normal mt-1.5 pb-2",
                  isCompleted && !isRejected && "text-primary",
                  isCompleted && isRejected && "text-destructive",
                  isCurrent && !isRejected && "text-primary",
                  isCurrent && isRejected && "text-destructive",
                  isPending && "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 flex items-center px-4 -translate-y-1">
                <div className="relative w-full h-[4px] rounded-full bg-muted-foreground/30">
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out",
                      stepIndex < currentIndex
                        ? isRejected
                          ? "bg-destructive w-full"
                          : "bg-primary w-full"
                        : stepIndex === currentIndex
                        ? isRejected
                          ? "bg-destructive w-1/2"
                          : "bg-primary w-1/2"
                        : "w-0"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

