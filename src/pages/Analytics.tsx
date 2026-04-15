import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const monthlyData = [
  { month: "Jan", reports: 89, collected: 72 },
  { month: "Feb", reports: 120, collected: 98 },
  { month: "Mar", reports: 145, collected: 110 },
  { month: "Apr", reports: 178, collected: 142 },
];

const pieData = [
  { name: "Bottles", value: 35 },
  { name: "Bags", value: 28 },
  { name: "Packaging", value: 22 },
  { name: "Other", value: 15 },
];

const COLORS = ["hsl(145 35% 23%)", "hsl(145 50% 55%)", "hsl(145 25% 70%)", "hsl(145 15% 85%)"];

const trendData = [
  { week: "W1", impact: 120 },
  { week: "W2", impact: 180 },
  { week: "W3", impact: 150 },
  { week: "W4", impact: 220 },
  { week: "W5", impact: 280 },
  { week: "W6", impact: 310 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">Track waste collection trends and environmental impact</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Monthly Reports vs Collected</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(145 15% 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="reports" fill="hsl(145 35% 23%)" radius={[4, 4, 0, 0]} name="Reported" />
              <Bar dataKey="collected" fill="hsl(145 50% 55%)" radius={[4, 4, 0, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Waste Types</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 glass-card rounded-lg p-5">
          <h3 className="font-heading font-semibold mb-4">Impact Trend (kg collected)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 15% 88%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150 10% 45%)" />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(145 15% 88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="impact" stroke="hsl(145 35% 23%)" strokeWidth={2} dot={{ fill: "hsl(145 50% 55%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
