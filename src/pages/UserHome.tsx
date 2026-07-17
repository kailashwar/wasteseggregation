import { Camera, MapPin, ClipboardList, QrCode, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReports } from "@/hooks/useReports";
import { HomeBio } from "@/components/HomeBio";

export default function UserHome() {
  const { username, credits, photoCount } = useAuth();
  const { reports } = useReports();
  const myReports = reports.length;

  const tiles = [
    { to: "/report", icon: Camera, label: "Report Garbage", desc: "Snap a photo, share location" },
    { to: "/map", icon: MapPin, label: "Map View", desc: "See nearby reports" },
    { to: "/reports", icon: ClipboardList, label: "My Reports", desc: `${myReports} submitted` },
    { to: "/credits", icon: QrCode, label: "My Credits", desc: `${credits} earned` },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">
          Hi {username ?? "friend"} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back to Waste Segregation — let's keep the streets a little cleaner today.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Credits</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Coins className="h-4 w-4 text-primary" />
            <p className="text-xl font-bold">{credits}</p>
          </div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Photos</p>
          <p className="text-xl font-bold mt-1">{photoCount}</p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Reports</p>
          <p className="text-xl font-bold mt-1">{myReports}</p>
        </div>
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Next reward</p>
          <p className="text-xl font-bold mt-1">
            {photoCount % 2 === 0 ? 2 : 1} 📸
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="glass-card rounded-lg p-5 flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <t.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <HomeBio />
    </div>
  );
}
