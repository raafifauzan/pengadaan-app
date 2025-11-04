import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const mockProgres = [
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Progres Dokumen Evaluasi</h1>
          <p className="text-muted-foreground">Monitor kelengkapan dokumen evaluasi vendor</p>
        </div>

        <div className="grid gap-4">
          {mockProgres.map((item) => (
            <Card key={item.id} className="shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <span className="font-mono text-sm px-3 py-1 bg-primary/10 text-primary rounded-md">
                    {item.id}
                  </span>
                </div>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
