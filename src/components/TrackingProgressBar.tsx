"use client";

import { CheckCircle2, Circle, Clock, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import React from "react";

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

export function TrackingProgressBar({
  currentStep,
  className,
  isRejected = false,
}: TrackingProgressBarProps) {
  const idx = stepOrder.indexOf(currentStep);
  const currentIndex = idx >= 0 ? idx : 0;

  return (
    <>
      {/* CSS animasi dimasukkan langsung di sini */}
      <style>{`
        /* ===== Progress connector effects (self-contained) ===== */
        @keyframes conn-stripes-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 32px 0;
          }
        }

        @keyframes conn-shimmer-move {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        /* Stripes diagonal bergerak */
        .conn-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.28) 0 8px,
            rgba(255, 255, 255, 0) 8px 16px
          );
          background-size: 32px 100%;
          animation: conn-stripes-move 1.1s linear infinite;
          mix-blend-mode: overlay;
          pointer-events: none;
          will-change: background-position;
        }

        /* Shimmer (kilau) melintas */
        .conn-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.65) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          filter: blur(0.5px);
          animation: conn-shimmer-move 1.2s ease-in-out infinite;
          pointer-events: none;
          will-change: transform;
        }

        /* Glow lembut mengikuti lebar bar (opsional) */
        .conn-glow {
          box-shadow: 0 0 8px currentColor, 0 0 14px currentColor;
          opacity: 0.35;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .conn-stripes,
          .conn-shimmer {
            animation: none !important;
          }
        }
      `}</style>

      <div className={cn("inline-flex items-center gap-2 py-4", className)}>
        {steps.map((step, index) => {
          const stepIndex = stepOrder.indexOf(step.key);
          const isCanceledStep = isRejected && stepIndex === currentIndex;
          const isCompleted = stepIndex < currentIndex && !isCanceledStep;
          const isCurrent = stepIndex === currentIndex;
          const isPending = stepIndex > currentIndex;

          const connectorState =
            stepIndex < currentIndex ? "full" : stepIndex === currentIndex ? "half" : "none";

          if (isRejected && stepIndex > currentIndex) return null;

          const connectorWidth =
            connectorState === "full" ? "100%" : connectorState === "half" ? "50%" : "0%";

          return (
            <div key={step.key} className="flex items-center w-[88px]">
              {/* Step icon + label */}
              <div className="flex flex-col items-center flex-none w-[72px] relative z-10">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                    "transition-all duration-300 ease-out",
                    isCompleted && !isRejected && "bg-primary text-primary-foreground scale-105",
                    isCompleted && isRejected && "bg-destructive text-destructive-foreground scale-105",
                    isCurrent &&
                      !isRejected &&
                      "bg-primary text-primary-foreground scale-110 ring-2 ring-primary/20 shadow-lg",
                    isCurrent &&
                      isRejected &&
                      "bg-destructive text-destructive-foreground scale-110 ring-2 ring-destructive/30 shadow-lg",
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
                    "text-[10px] leading-tight text-center whitespace-nowrap font-normal mt-2",
                    "transition-colors duration-200",
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

              {/* Connector line */}
              {index < steps.length - 1 && !isCanceledStep && (
                <div className="flex-1 flex items-center -mt-4 ml-[-20px] mr-[-27px] px-2">
                  <div className="relative w-full h-[3px] rounded-full bg-muted-foreground/25 overflow-hidden">
                    {/* Bar utama (lebar dianimasikan) */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full",
                        isRejected ? "bg-destructive" : "bg-primary",
                        "transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      )}
                      style={{ width: connectorWidth }}
                    >
                      {/* Stripes bergerak */}
                      <div className="conn-stripes absolute inset-0 opacity-40" />
                      {/* Shimmer kilau */}
                      <div className="conn-shimmer absolute inset-y-[-6px] left-0 w-[40%]" />
                    </div>

                    {/* Glow mengikuti lebar (opsional, bisa dihapus) */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full conn-glow",
                        isRejected ? "text-destructive" : "text-primary"
                      )}
                      style={{ width: connectorWidth }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default TrackingProgressBar;
