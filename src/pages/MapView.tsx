import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useReports } from "@/hooks/useReports";
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

export default function MapView() {
  const { reports, loading, updateStatus } = useReports();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const center: [number, number] = reports.length
    ? [reports[0].lat, reports[0].lng]
    : [13.0627, 80.2707];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-heading font-bold">Garbage Map</h2>
        <p className="text-muted-foreground text-sm mt-1">All reported locations</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-3 py-1.5 rounded-full bg-warning/10 text-warning font-medium">
          ● Pending: {reports.filter((r) => r.status === "pending").length}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
          ● In Progress: {reports.filter((r) => r.status === "in_progress").length}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success font-medium">
          ● Completed: {reports.filter((r) => r.status === "completed").length}
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
          {reports.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lng]}>
              <Popup>
                <div className="text-sm space-y-2 min-w-[200px]">
                  {r.photo_url && (
                    <img src={r.photo_url} alt="Report" className="w-full h-24 object-cover rounded" />
                  )}
                  <p className="font-semibold">{r.location_name ?? "Reported location"}</p>
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
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
