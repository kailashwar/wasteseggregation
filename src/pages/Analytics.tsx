import { useMemo } from "react";
import { useReports } from "@/hooks/useReports";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const COLORS = ["hsl(145 35% 23%)", "hsl(145 50% 55%)", "hsl(145 25% 70%)"];

export default function Analytics() {
  const { reports } = useReports();

  const statusData = useMemo(() => [
    { name: "Pending", value: reports.filter((r) => r.status === "pending").length },
    { name: "In Progress", value: reports.filter((r) => r.status === "in_progress").length },
    { name: "Completed", value: reports.filter((r) => r.status === "completed").length },
  ], [reports]);

  // Reports per day (last 14 days)
  const dailyData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return days.map((d) => ({
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      reports: reports.filter((r) => new Date(r.created_at).toDateString() === d.toDateString()).length,
    }));
  }, [reports]);

  // Cumulative completed
  const trendData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      d.setHours(23, 59, 59, 999);
      return d;
    });
    return days.map((d) => ({
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      completed: reports.filter((r) => r.status === "completed" && new Date(r.updated_at) <= d).length,
    }));
  }, [reports]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">Trends across the cleanup operation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Reports per Day (14d)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(150 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(145 15% 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="reports" fill="hsl(145 35% 23%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Cumulative Completed</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(150 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(145 15% 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="completed" stroke="hsl(145 35% 23%)" strokeWidth={2} dot={{ fill: "hsl(145 50% 55%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
