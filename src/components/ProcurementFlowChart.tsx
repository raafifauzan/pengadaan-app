import { Wrench, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProcurementStats } from "@/hooks/useProcurementStats";
import { Skeleton } from "@/components/ui/skeleton";

interface FlowStageProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
  description?: string;
}

const FlowStage = ({ icon, title, count, color, description }: FlowStageProps) => (
  <Card className={`${color} p-4 min-w-[180px] relative group hover:shadow-lg transition-shadow`}>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-background/50 rounded-lg">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
        <div className="text-2xl font-bold">{count}</div>
      </div>
    </div>
  </Card>
);

const FlowArrow = ({ dashed = false }: { dashed?: boolean }) => (
  <div className="flex items-center px-2">
    <ArrowRight 
      className={`h-6 w-6 text-muted-foreground ${dashed ? 'opacity-50' : ''}`} 
      strokeDasharray={dashed ? "4 4" : undefined}
    />
  </div>
);

const ApprovalBox = () => (
  <Card className="border-2 border-dashed border-primary/30 p-4 bg-primary/5">
    <h3 className="font-semibold mb-3 text-sm">Approval Form Evaluasi</h3>
    <div className="space-y-2">
      {[
        "Kabag. Sekretariat Perusahaan",
        "SEVP Operasional",
        "Kabag. Keuangan",
        "SEVP Business Support",
        "Direktur"
      ].map((role, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <div className="p-1.5 bg-primary/20 rounded">
            <Wrench className="h-3 w-3 text-primary" />
          </div>
          <span className="text-muted-foreground">{role}</span>
        </div>
      ))}
    </div>
  </Card>
);

export function ProcurementFlowChart() {
  const { data: stats, isLoading } = useProcurementStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mapping Proses Pengadaan</h2>
        <p className="text-muted-foreground">
          Visualisasi alur dan jumlah pengajuan di setiap tahap proses
        </p>
      </div>

      {/* Main Flow - First Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        <FlowStage
          icon={<Wrench className="h-5 w-5 text-destructive" />}
          title="Disposisi Memo"
          count={stats.disposisiMemo}
          color="bg-destructive/10"
        />

        <FlowArrow />

        <div className="min-w-[280px]">
          <ApprovalBox />
        </div>

        <FlowArrow dashed />

        <div className="flex flex-col gap-2">
          <FlowStage
            icon={<Wrench className="h-5 w-5 text-cyan-600" />}
            title="Approval Form HPS"
            count={stats.approvalFormHPS}
            color="bg-cyan-100 dark:bg-cyan-950"
            description="Pengadaan > 200 Juta"
          />
          <FlowStage
            icon={<Wrench className="h-5 w-5 text-primary" />}
            title="Form Evaluasi"
            count={stats.approvalFormEvaluasi}
            color="bg-primary/10"
          />
        </div>

        <FlowArrow />

        <FlowStage
          icon={<Wrench className="h-5 w-5 text-amber-600" />}
          title="Pengadaan"
          count={stats.pengadaan}
          color="bg-amber-100 dark:bg-amber-950"
        />

        <FlowArrow />

        <FlowStage
          icon={<Wrench className="h-5 w-5 text-amber-600" />}
          title="Pembayaran"
          count={stats.pembayaran}
          color="bg-amber-100 dark:bg-amber-950"
        />

        <FlowArrow />

        <FlowStage
          icon={<Wrench className="h-5 w-5 text-emerald-600" />}
          title="Pengadaan Selesai"
          count={stats.selesai}
          color="bg-emerald-100 dark:bg-emerald-950"
        />
      </div>

      {/* Stats Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Pengajuan Aktif</p>
            <p className="text-3xl font-bold">
              {stats.disposisiMemo + 
               stats.approvalFormEvaluasi + 
               stats.approvalFormHPS + 
               stats.pengadaan + 
               stats.pembayaran}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Selesai</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.selesai}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
