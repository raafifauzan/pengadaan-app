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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tracking Pengajuan</h1>
        <p className="text-muted-foreground mt-1">
          Monitor status dan progress pengajuan procurement
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTracking.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.currentStage}</TableCell>
                <TableCell>{item.lastUpdate}</TableCell>
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
  );
}
