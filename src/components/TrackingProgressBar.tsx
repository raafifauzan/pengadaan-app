import { CheckCircle2, Circle, Clock, CircleX } from "lucide-react";
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
  const currentIndex = Math.max(0, stepOrder.indexOf(currentStep));

  return (
    <div className={cn("inline-flex items-center gap-2 py-4", className)}>
      {steps.map((step, index) => {
        const stepIndex = stepOrder.indexOf(step.key);
        const isCanceledStep = isRejected && stepIndex === currentIndex;
        const isCompleted = stepIndex < currentIndex && !isCanceledStep;
        const isCurrent = stepIndex === currentIndex;
        const isPending = stepIndex > currentIndex;
        const connectorState =
          stepIndex < currentIndex
            ? "full"
            : stepIndex === currentIndex
            ? "half"
            : "none";

        if (isRejected && stepIndex > currentIndex) {
          return null;
        }

        return (
          <div key={step.key} className="flex items-center w-[88px]">
            <div className="flex flex-col items-center flex-none w-[72px] relative z-10">
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
                {isCanceledStep ? (
                  <CircleX className="w-5 h-5" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>

              <p
                className={cn(
                  "text-[10px] leading-tight text-center transition-all duration-300 whitespace-nowrap font-normal mt-2",
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

            {index < steps.length - 1 && !isCanceledStep && (
              <div className="flex-1 flex items-center -mt-4 ml-[-20px] mr-[-27px] px-2">
                <div className="relative w-full h-[3px] rounded-full bg-muted-foreground/25">
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-in-out",
                      isRejected ? "bg-destructive" : "bg-primary",
                      connectorState === "full" && "w-full",
                      connectorState === "half" && "w-1/2",
                      connectorState === "none" && "w-0"
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
