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
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead className="min-w-[180px]">Judul</TableHead>
                    <TableHead className="w-[150px]">Vendor</TableHead>
                    <TableHead className="w-[130px]">Amount</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Est. Delivery</TableHead>
                    <TableHead className="w-[180px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPengadaan
                    .filter((item) => item.status === "waiting_po")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.id}</TableCell>
                        <TableCell className="text-sm">{item.title}</TableCell>
                        <TableCell className="text-sm">{item.vendor}</TableCell>
                        <TableCell className="text-sm">{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status as any} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.estimatedDelivery &&
                            new Date(item.estimatedDelivery).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(item.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve PO
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(item.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
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
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead className="min-w-[180px]">Judul</TableHead>
                    <TableHead className="w-[150px]">Vendor</TableHead>
                    <TableHead className="w-[120px]">PO Number</TableHead>
                    <TableHead className="w-[130px]">Amount</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Est. Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPengadaan
                    .filter((item) => item.status !== "waiting_po")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.id}</TableCell>
                        <TableCell className="text-sm">{item.title}</TableCell>
                        <TableCell className="text-sm">{item.vendor}</TableCell>
                        <TableCell className="text-sm">{item.poNumber || "-"}</TableCell>
                        <TableCell className="text-sm">{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status as any} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.estimatedDelivery &&
                            new Date(item.estimatedDelivery).toLocaleDateString("id-ID")}
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
