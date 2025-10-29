import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
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

type EvaluationStatus = "pending_evaluation" | "evaluated" | "approved" | "rejected";

interface EvaluationRequest {
  id: string;
  title: string;
  vendor: string;
  amount: number;
  status: EvaluationStatus;
  approvedDate: string;
}

const mockEvaluations: EvaluationRequest[] = [
  {
    id: "REQ-003",
    title: "Peralatan Meeting",
    vendor: "PT Maju Jaya",
    amount: 8000000,
    status: "pending_evaluation",
    approvedDate: "2024-01-15",
  },
  {
    id: "REQ-005",
    title: "Pengadaan Komputer",
    vendor: "PT Tech Solutions",
    amount: 35000000,
    status: "evaluated",
    approvedDate: "2024-01-14",
  },
  {
    id: "REQ-006",
    title: "Alat Tulis Kantor",
    vendor: "CV Sumber Makmur",
    amount: 5000000,
    status: "approved",
    approvedDate: "2024-01-13",
  },
];

export default function FormEvaluasi() {
  const { toast } = useToast();

  const handlePrint = (id: string) => {
    toast({
      title: "Generate Form Evaluasi",
      description: `Mencetak form evaluasi untuk ${id}`,
    });
    // In real implementation, this would generate and print the document
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Evaluasi</h1>
        <p className="text-muted-foreground mt-1">
          Generate dan kelola form evaluasi vendor
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pengajuan</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tanggal Approval</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEvaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell className="font-medium">{evaluation.id}</TableCell>
                <TableCell>{evaluation.title}</TableCell>
                <TableCell>{evaluation.vendor}</TableCell>
                <TableCell>{formatCurrency(evaluation.amount)}</TableCell>
                <TableCell>
                  {new Date(evaluation.approvedDate).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <StatusBadge status={evaluation.status as any} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(evaluation.id)}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    <Button size="sm" variant="default">
                      <FileText className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
