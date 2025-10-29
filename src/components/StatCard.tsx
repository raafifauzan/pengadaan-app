import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "from-primary/10 to-primary-glow/10 text-primary",
  success: "from-success/10 to-success/20 text-success",
  warning: "from-warning/10 to-warning/20 text-warning",
  danger: "from-destructive/10 to-destructive/20 text-destructive",
};

export const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className={`p-4 rounded-xl bg-gradient-to-br ${variantStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
