import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type PengadaanStatus = "waiting_po" | "po_issued" | "in_delivery" | "completed";

interface PengadaanItem {
  id: string;
  title: string;
  vendor: string;
  amount: number;
  status: PengadaanStatus;
  poNumber?: string;
  estimatedDelivery?: string;
}

const mockPengadaan: PengadaanItem[] = [
  {
    id: "REQ-003",
    title: "Peralatan Meeting",
    vendor: "PT Maju Jaya",
    amount: 8000000,
    status: "waiting_po",
    estimatedDelivery: "2024-01-25",
  },
  {
    id: "REQ-005",
    title: "Pengadaan Komputer",
    vendor: "PT Tech Solutions",
    amount: 35000000,
    status: "po_issued",
    poNumber: "PO-2024-001",
    estimatedDelivery: "2024-01-30",
  },
  {
    id: "REQ-007",
    title: "Meja Kerja",
    vendor: "CV Furniture Sejahtera",
    amount: 18000000,
    status: "in_delivery",
    poNumber: "PO-2024-002",
    estimatedDelivery: "2024-01-20",
  },
];

export default function Pengadaan() {
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    toast({
      title: "PO Disetujui",
      description: `Purchase Order untuk ${id} telah disetujui.`,
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "PO Ditolak",
      description: `Purchase Order untuk ${id} telah ditolak.`,
      variant: "destructive",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pengadaan</h1>
          <p className="text-muted-foreground mt-1">
            Pengaturan dan approval pengadaan
          </p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Pengaturan
        </Button>
      </div>

      <Tabs defaultValue="approval" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approval">Approval Pengadaan</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="approval" className="space-y-4">
          <div className="bg-card rounded-lg border overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] px-3">ID</TableHead>
                    <TableHead className="w-[220px] px-3">Judul</TableHead>
                    <TableHead className="w-[180px] px-3">Vendor</TableHead>
                    <TableHead className="w-[140px] px-3">Nilai</TableHead>
                    <TableHead className="w-[120px] px-3 text-center">Status</TableHead>
                    <TableHead className="w-[140px] px-3 text-center">Est. Delivery</TableHead>
                    <TableHead className="w-[200px] px-3 text-right">Status &amp; Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPengadaan
                    .filter((item) => item.status === "waiting_po")
                    .map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="px-3 py-2 font-mono text-sm text-muted-foreground">
                          {item.id}
                        </TableCell>
                        <TableCell className="px-3 py-2 w-[220px] max-w-[220px] text-sm whitespace-normal break-words">
                          {item.title}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm">
                          {item.vendor}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center">
                          <StatusBadge status={item.status as any} />
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-center">
                          {item.estimatedDelivery
                            ? new Date(item.estimatedDelivery).toLocaleDateString("id-ID")
                            : "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(item.id)}
                              className="h-6 px-2.5 rounded-full border border-emerald-200 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-600 hover:border-emerald-200 text-[10px] font-semibold gap-1"
                            >
                              <Check className="h-2.5 w-2.5" />
                              <span className="leading-none">Setujui</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(item.id)}
                              className="h-6 px-2.5 rounded-full border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive hover:border-destructive/20 text-[10px] font-semibold gap-1"
                            >
                              <X className="h-2.5 w-2.5" />
                              <span className="leading-none">Tolak</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="bg-card rounded-lg border overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] px-3">ID</TableHead>
                    <TableHead className="w-[220px] px-3">Judul</TableHead>
                    <TableHead className="w-[180px] px-3">Vendor</TableHead>
                    <TableHead className="w-[140px] px-3">PO Number</TableHead>
                    <TableHead className="w-[140px] px-3">Nilai</TableHead>
                    <TableHead className="w-[120px] px-3 text-center">Status</TableHead>
                    <TableHead className="w-[140px] px-3 text-center">Est. Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPengadaan
                    .filter((item) => item.status !== "waiting_po")
                    .map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="px-3 py-2 font-mono text-sm text-muted-foreground">
                          {item.id}
                        </TableCell>
                        <TableCell className="px-3 py-2 w-[220px] max-w-[220px] text-sm whitespace-normal break-words">
                          {item.title}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm">
                          {item.vendor}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm font-mono text-muted-foreground">
                          {item.poNumber || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center">
                          <StatusBadge status={item.status as any} />
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-center">
                          {item.estimatedDelivery
                            ? new Date(item.estimatedDelivery).toLocaleDateString("id-ID")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
