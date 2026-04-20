import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useReports, type ReportPriority } from "@/hooks/useReports";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const PRIORITY_META: Record<ReportPriority, { label: string; color: string; rank: number }> = {
  high: { label: "Red — High", color: "#ef4444", rank: 0 },
  medium: { label: "Yellow — Medium", color: "#eab308", rank: 1 },
  low: { label: "Green — Low", color: "#22c55e", rank: 2 },
};

const buildPriorityIcon = (color: string) =>
  L.divIcon({
    className: "priority-marker",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: bold; font-size: 14px;
    ">!</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

const PRIORITY_ICONS: Record<ReportPriority, L.DivIcon> = {
  high: buildPriorityIcon(PRIORITY_META.high.color),
  medium: buildPriorityIcon(PRIORITY_META.medium.color),
  low: buildPriorityIcon(PRIORITY_META.low.color),
};

export default function MapView() {
  const { reports, loading, updateStatus } = useReports();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  // Sort by priority: red (high) → yellow (medium) → green (low), then newest first
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const pa = PRIORITY_META[a.priority]?.rank ?? 99;
      const pb = PRIORITY_META[b.priority]?.rank ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [reports]);

  const center: [number, number] = sortedReports.length
    ? [sortedReports[0].lat, sortedReports[0].lng]
    : [13.0627, 80.2707];

  const counts = {
    high: reports.filter((r) => r.priority === "high").length,
    medium: reports.filter((r) => r.priority === "medium").length,
    low: reports.filter((r) => r.priority === "low").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-heading font-bold">Garbage Map</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Reports prioritised: Red → Yellow → Green
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 text-destructive font-medium">
          🔴 Red (High): {counts.high}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-warning/10 text-warning font-medium">
          🟡 Yellow (Medium): {counts.medium}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success font-medium">
          🟢 Green (Low): {counts.low}
        </span>
      </div>

      <div className="glass-card rounded-lg overflow-hidden relative" style={{ height: "calc(100vh - 240px)", minHeight: 400 }}>
        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {sortedReports.map((r) => {
            const meta = PRIORITY_META[r.priority] ?? PRIORITY_META.medium;
            return (
              <Marker
                key={r.id}
                position={[r.lat, r.lng]}
                icon={PRIORITY_ICONS[r.priority] ?? PRIORITY_ICONS.medium}
                zIndexOffset={(2 - meta.rank) * 1000}
              >
                <Popup>
                  <div className="text-sm space-y-2 min-w-[220px]">
                    {r.photo_url && (
                      <img src={r.photo_url} alt="Report" className="w-full h-24 object-cover rounded" />
                    )}
                    <div
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {meta.label} priority
                    </div>
                    <p className="font-semibold">{r.location_name ?? "Reported location"}</p>
                    <p className="text-xs text-gray-500">
                      📍 {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                    </p>
                    {r.description && <p className="text-gray-600">{r.description}</p>}
                    <p className="text-xs text-gray-500">By {r.reporter_username ?? "User"}</p>
                    <p className={
                      r.status === "completed" ? "text-green-600 font-medium" :
                      r.status === "in_progress" ? "text-blue-600 font-medium" :
                      "text-orange-500 font-medium"
                    }>
                      Status: {STATUS_LABEL[r.status]}
                    </p>
                    {isAdmin && (
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value as any)}
                        className="w-full text-xs border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
