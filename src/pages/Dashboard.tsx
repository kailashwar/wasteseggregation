import { ClipboardList, CheckCircle2, MapPin, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { useReports } from "@/hooks/useReports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { HomeBio } from "@/components/HomeBio";

export default function Dashboard() {
  const { reports } = useReports();

  const pending = reports.filter((r) => r.status === "pending").length;
  const inProgress = reports.filter((r) => r.status === "in_progress").length;
  const completed = reports.filter((r) => r.status === "completed").length;
  const total = reports.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  // Last 7 days activity
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return days.map((d) => {
      const dayKey = d.toDateString();
      const reported = reports.filter((r) => new Date(r.created_at).toDateString() === dayKey).length;
      const done = reports.filter(
        (r) => new Date(r.updated_at).toDateString() === dayKey && r.status === "completed"
      ).length;
      return {
        name: d.toLocaleDateString(undefined, { weekday: "short" }),
        reported,
        completed: done,
      };
    });
  }, [reports]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Overview of garbage reports and cleanup progress</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Reports" value={String(total)} subtitle="all time" icon={ClipboardList} />
        <StatsCard title="Completed" value={String(completed)} subtitle="cleaned up" icon={CheckCircle2} trend={`${completionRate}%`} />
        <StatsCard title="Pending" value={String(pending)} subtitle="awaiting action" icon={MapPin} />
        <StatsCard title="In Progress" value={String(inProgress)} subtitle="being handled" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(145 15% 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="reported" fill="hsl(145 35% 23%)" radius={[4, 4, 0, 0]} name="Reported" />
              <Bar dataKey="completed" fill="hsl(145 50% 55%)" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {reports.length === 0 && <p className="text-sm text-muted-foreground">No reports yet.</p>}
            {reports.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.location_name ?? "Reported location"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                  r.status === "completed" ? "bg-success/10 text-success" :
                  r.status === "in_progress" ? "bg-primary/10 text-primary" :
                  "bg-warning/10 text-warning"
                }`}>
                  {r.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HomeBio />
    </div>
  );
}
