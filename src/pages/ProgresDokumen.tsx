import { useMemo, useState } from "react";
import { FileText, Info } from "lucide-react";

import type { Tables } from "@/integrations/supabase/types";
import { useFormEvaluasi } from "@/hooks/useFormEvaluasi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type FormEvaluasiRecord = Tables<"form_evaluasi"> & {
  pengajuan: Tables<"pengajuan"> | null;
  approval: Tables<"form_approval"> | null;
};

const APPROVAL_STEPS: Array<keyof NonNullable<FormEvaluasiRecord["approval"]>> = [
  "sekper_date",
  "sevp_operation_date",
  "keuangan_date",
  "sevp_support_date",
  "direktur_date",
];

const fallbackProgress = [
  {
    id: "EVAL-001",
    title: "Evaluasi Laptop HP",
    totalDokumen: 12,
    terkumpul: 8,
    progress: 67,
  },
  {
    id: "EVAL-002",
    title: "Evaluasi Furniture Kantor",
    totalDokumen: 10,
    terkumpul: 10,
    progress: 100,
  },
  {
    id: "EVAL-003",
    title: "Evaluasi Printer",
    totalDokumen: 8,
    terkumpul: 4,
    progress: 50,
  },
];

export default function ProgresDokumen() {
  const { data: formEvaluasiData } = useFormEvaluasi();
  const [selected, setSelected] = useState<FormEvaluasiRecord | null>(null);

  const progresItems = useMemo(() => {
    if (!formEvaluasiData || formEvaluasiData.length === 0) {
      return fallbackProgress.map((item) => ({ ...item, fallback: true }));
    }

    return formEvaluasiData.map((evaluation) => {
      const collected = APPROVAL_STEPS.reduce((count, step) => {
        const dateValue = evaluation.approval?.[step];
        return count + (dateValue ? 1 : 0);
      }, 0);

      const totalSteps = APPROVAL_STEPS.length;
      const progress = totalSteps === 0 ? 0 : Math.round((collected / totalSteps) * 100);

      return {
        id: evaluation.kode_form || evaluation.id,
        title: evaluation.pengajuan?.judul || "Tanpa Judul",
        totalDokumen: totalSteps,
        terkumpul: collected,
        progress: evaluation.is_final ? 100 : progress,
        lampiranUrl: evaluation.pengajuan?.lampiran_url ?? null,
        lampiranLabel:
          evaluation.pengajuan?.no_surat ||
          (evaluation.pengajuan?.lampiran_url
            ? evaluation.pengajuan.lampiran_url.split("/").pop() ?? "-"
            : "-"),
        raw: evaluation,
      };
    });
  }, [formEvaluasiData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Progres Dokumen Evaluasi</h1>
          <p className="text-muted-foreground">Monitor kelengkapan dokumen evaluasi vendor</p>
        </div>

        <div className="grid gap-4">
          {progresItems.map((item) => (
            <Card
              key={item.id}
              className="shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => !("fallback" in item) && setSelected(item.raw ?? null)}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <span className="font-mono text-sm px-3 py-1 bg-primary/10 text-primary rounded-md">
                    {item.id}
                  </span>
                </div>
                {"lampiranUrl" in item && item.lampiranUrl && (
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 transition-colors duration-150 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <a
                        href={item.lampiranUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 no-underline text-primary"
                      >
                        <FileText className="h-3 w-3" />
                        {item.lampiranLabel}
                      </a>
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dokumen Terkumpul</span>
                  <span className="font-semibold">
                    {item.terkumpul} / {item.totalDokumen}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} />
                </div>
                {"fallback" in item ? (
                  <p className="text-xs text-muted-foreground">
                    Data contoh. Akan tergantikan otomatis ketika form evaluasi sudah tersedia.
                  </p>
                ) : (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelected(item.raw ?? null);
                    }}
                  >
                    <Info className="h-3.5 w-3.5" />
                    Detail
                  </Button>
                </div>
              )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.pengajuan?.judul || "Detail Evaluasi"}</DialogTitle>
                <DialogDescription>{selected.kode_form || selected.id}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">No Surat</p>
                    <p className="text-foreground">{selected.pengajuan?.no_surat || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jenis Pengajuan</p>
                    <p className="text-foreground">{selected.pengajuan?.jenis || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nilai Pengajuan</p>
                    <p className="text-foreground">
                      {selected.pengajuan?.nilai_pengajuan?.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }) ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status Pengajuan</p>
                    <p className="text-foreground capitalize">{selected.pengajuan?.status || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Lampiran</p>
                    {(() => {
                      const lampiranUrl =
                        selected.pengajuan?.lampiran_url ??
                        (selected as { lampiran_url?: string; lampiran?: string }).lampiran_url ??
                        (selected as { lampiran_url?: string; lampiran?: string }).lampiran ??
                        null;
                      const lampiranLabel =
                        selected.pengajuan?.no_surat ||
                        (lampiranUrl ? lampiranUrl.split("/").pop() : "Tidak ada lampiran");

                      if (!lampiranUrl) {
                        return (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium bg-white text-muted-foreground border-muted/20 px-1.5 py-0.5"
                          >
                            Tidak ada lampiran
                          </Badge>
                        );
                      }

                      return (
                        <Badge
                          variant="outline"
                          className="inline-flex text-[11px] font-medium bg-white text-primary border-primary/20 px-1.5 py-0.5 transition-colors duration-150 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                        >
                          <a
                            href={lampiranUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 no-underline text-primary"
                          >
                            <FileText className="h-3 w-3" />
                            {lampiranLabel}
                          </a>
                        </Badge>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Kelengkapan Dokumen</p>
                  <ul className="text-sm space-y-1">
                    {APPROVAL_STEPS.map((step) => {
                      const label = String(step).replace(/_/g, " ").replace("date", "").trim();
                      return (
                        <li key={step} className="flex items-center justify-between border-b py-1 last:border-0">
                          <span className="capitalize">{label}</span>
                          <span className="text-muted-foreground text-xs">
                            {selected.approval?.[step] ? "Sudah" : "Belum"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
