import { StatusBadge, ProcurementStatus } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

type TrackingItem = {
  id: string;
  title: string;
  status: ProcurementStatus;
  currentStage: string;
  lastUpdate: string;
  progress: number;
};

const mockTracking: TrackingItem[] = [
  {
    id: "REQ-001",
    title: "Pengadaan Laptop",
    status: "in_progress",
    currentStage: "Vendor Selection",
    lastUpdate: "2024-01-15 14:30",
    progress: 45,
  },
  {
    id: "REQ-002",
    title: "Furniture Kantor",
    status: "in_progress",
    currentStage: "Budget Approval",
    lastUpdate: "2024-01-16 09:15",
    progress: 30,
  },
  {
    id: "REQ-003",
    title: "Peralatan Meeting",
    status: "completed",
    currentStage: "Delivered",
    lastUpdate: "2024-01-14 16:45",
    progress: 100,
  },
  {
    id: "REQ-004",
    title: "Software License",
    status: "in_progress",
    currentStage: "Form Evaluasi",
    lastUpdate: "2024-01-17 11:20",
    progress: 65,
  },
];

export default function Tracking() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Tracking Pengajuan</h1>
        <p className="text-muted-foreground mt-1">
          Monitor status dan progress pengajuan procurement
        </p>
      </div>

      <div className="bg-card rounded-lg border overflow-x-auto">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="min-w-[180px]">Judul</TableHead>
                <TableHead className="w-[140px]">Current Stage</TableHead>
                <TableHead className="w-[140px]">Last Update</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[140px]">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTracking.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm">{item.id}</TableCell>
                  <TableCell className="text-sm">{item.title}</TableCell>
                  <TableCell className="text-sm">{item.currentStage}</TableCell>
                  <TableCell className="text-sm">{item.lastUpdate}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={item.progress} className="w-24" />
                      <span className="text-sm font-medium min-w-[3rem]">
                        {item.progress}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
