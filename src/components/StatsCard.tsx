import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="glass-card rounded-lg p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && <span className="text-xs font-medium text-success">{trend}</span>}
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </div>
  );
}
