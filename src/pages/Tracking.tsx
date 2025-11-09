import { Loader2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrackingProgressBar } from "@/components/TrackingProgressBar";
import { useTracking } from "@/hooks/useTracking";
import { format } from "date-fns";

export default function Tracking() {
  const { data: trackingData, isLoading, error } = useTracking();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Tracking Pengajuan</h1>
        <p className="text-muted-foreground mt-1">
          Monitor status dan progress pengajuan procurement
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Memuat data tracking...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data tracking. Silakan coba lagi atau hubungi administrator.
            <br />
            <span className="text-xs mt-2 block">
              {error instanceof Error ? error.message : "Unknown error"}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-card rounded-lg border overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Tanggal Pengajuan</TableHead>
                  <TableHead className="min-w-[200px]">Judul Pengajuan</TableHead>
                  <TableHead className="min-w-[720px] md:min-w-[820px]">Progres Terkini</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackingData && trackingData.length > 0 ? (
                  trackingData.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">
                          {format(new Date(item.tanggalPengajuan), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <div className="font-semibold">{item.judul || "Tanpa Judul"}</div>
                            {item.noSurat && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.noSurat}
                              </div>
                            )}
                            {item.unit && (
                              <div className="text-xs text-muted-foreground">
                                {item.unit}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TrackingProgressBar currentStep={item.currentStep} isRejected={item.isRejected} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Belum ada data tracking
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
