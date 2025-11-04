import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const mockPembayaran = [
  {
    id: "PAY-001",
    nomorSPK: "SPK/2024/001",
    vendor: "PT Teknologi Maju",
    jumlah: "Rp 75.000.000",
    tanggalJatuhTempo: "2024-03-20",
    status: "pending" as const,
  },
  {
    id: "PAY-002",
    nomorSPK: "SPK/2024/002",
    vendor: "CV Furniture Jaya",
    jumlah: "Rp 25.000.000",
    tanggalJatuhTempo: "2024-03-22",
    status: "pending" as const,
  },
];

export default function KonfirmasiPembayaran() {
  const handleKonfirmasi = (id: string) => {
    toast.success(`Pembayaran ${id} telah dikonfirmasi`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Konfirmasi Pembayaran</h1>
          <p className="text-muted-foreground">Konfirmasi pembayaran kepada vendor</p>
        </div>

        {mockPembayaran.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Tidak ada pembayaran yang perlu dikonfirmasi</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {mockPembayaran.map((item) => (
              <Card
                key={item.id}
                className="shadow-md hover:shadow-xl transition-all duration-300 border-2 border-warning/30"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm px-3 py-1 bg-warning/10 text-warning rounded-md font-semibold">
                            {item.id}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{item.nomorSPK}</h3>
                          <p className="text-muted-foreground">Vendor: {item.vendor}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Jatuh Tempo: </span>
                            <span className="font-medium">{item.tanggalJatuhTempo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{item.jumlah}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => handleKonfirmasi(item.id)}
                        className="flex-1 bg-gradient-to-r from-success to-success hover:shadow-lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Konfirmasi Pembayaran
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
