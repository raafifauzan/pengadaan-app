import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ProcurementStatus } from "@/components/StatusBadge";
import { CheckCircle, Circle, Clock } from "lucide-react";

const trackingData = [
  {
    id: "PR-001",
    title: "Pengadaan Laptop Dell XPS 15",
    status: "in_progress" as ProcurementStatus,
    timeline: [
      { step: "Pengajuan Dibuat", date: "15 Mar 2024", completed: true },
      { step: "Review Manager", date: "16 Mar 2024", completed: true },
      { step: "Approval Finance", date: "17 Mar 2024", completed: true },
      { step: "Purchase Order", date: "18 Mar 2024", completed: false, current: true },
      { step: "Delivery", date: "TBA", completed: false },
      { step: "Selesai", date: "TBA", completed: false },
    ],
  },
  {
    id: "PR-003",
    title: "Pengadaan Software Lisensi",
    status: "completed" as ProcurementStatus,
    timeline: [
      { step: "Pengajuan Dibuat", date: "13 Mar 2024", completed: true },
      { step: "Review Manager", date: "13 Mar 2024", completed: true },
      { step: "Approval Finance", date: "14 Mar 2024", completed: true },
      { step: "Purchase Order", date: "15 Mar 2024", completed: true },
      { step: "Delivery", date: "16 Mar 2024", completed: true },
      { step: "Selesai", date: "16 Mar 2024", completed: true },
    ],
  },
];

export default function Tracking() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tracking Procurement</h1>
          <p className="text-muted-foreground">Monitor progress pengadaan real-time</p>
        </div>

        <div className="space-y-6">
          {trackingData.map((item) => (
            <Card key={item.id} className="shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm px-3 py-1 bg-muted rounded-md">
                        {item.id}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.timeline.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {step.completed ? (
                          <CheckCircle className="w-6 h-6 text-success" />
                        ) : step.current ? (
                          <Clock className="w-6 h-6 text-primary animate-pulse" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                        {index < item.timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-12 ${
                              step.completed ? "bg-success" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h4
                          className={`font-semibold mb-1 ${
                            step.completed
                              ? "text-foreground"
                              : step.current
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.step}
                        </h4>
                        <p className="text-sm text-muted-foreground">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
