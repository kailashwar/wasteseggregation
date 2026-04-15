import { ClipboardList, CheckCircle2, MapPin, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { useWaste } from "@/contexts/WasteContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Mon", reports: 12, collected: 8 },
  { name: "Tue", reports: 19, collected: 14 },
  { name: "Wed", reports: 8, collected: 7 },
  { name: "Thu", reports: 15, collected: 11 },
  { name: "Fri", reports: 22, collected: 18 },
  { name: "Sat", reports: 30, collected: 22 },
  { name: "Sun", reports: 17, collected: 13 },
];

export default function Dashboard() {
  const { reports } = useWaste();
  const pending = reports.filter((r) => r.status === "pending").length;
  const collected = reports.filter((r) => r.status === "collected").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Overview of plastic waste reports and cleanup progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Reports" value={String(reports.length)} subtitle="in Chennai" icon={ClipboardList} />
        <StatsCard title="Collected" value={String(collected)} subtitle="waste cleaned" icon={CheckCircle2} trend={`${Math.round((collected / reports.length) * 100)}%`} />
        <StatsCard title="Pending" value={String(pending)} subtitle="awaiting pickup" icon={MapPin} />
        <StatsCard title="Impact" value="2.4T" subtitle="plastic removed" icon={TrendingUp} trend="+15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(145 15% 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="reports" fill="hsl(145 35% 23%)" radius={[4, 4, 0, 0]} name="Reported" />
              <Bar dataKey="collected" fill="hsl(145 50% 55%)" radius={[4, 4, 0, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{report.location}</p>
                  <p className="text-xs text-muted-foreground">{report.date}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  report.status === "collected" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
