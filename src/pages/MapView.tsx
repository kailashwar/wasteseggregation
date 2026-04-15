import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useWaste } from "@/contexts/WasteContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapView() {
  const { reports, markCollected } = useWaste();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-heading font-bold">Waste Map</h2>
        <p className="text-muted-foreground text-sm mt-1">View reported plastic waste locations across Chennai</p>
      </div>

      <div className="flex gap-3 mb-2">
        <span className="text-xs px-3 py-1.5 rounded-full bg-warning/10 text-warning font-medium">
          ● Pending: {reports.filter((r) => r.status === "pending").length}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success font-medium">
          ● Collected: {reports.filter((r) => r.status === "collected").length}
        </span>
      </div>

      <div className="glass-card rounded-lg overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <MapContainer
          center={[13.0627, 80.2707]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((report) => (
            <Marker key={report.id} position={[report.lat, report.lng]}>
              <Popup>
                <div className="text-sm space-y-2">
                  <p className="font-semibold">{report.location}</p>
                  <p className="text-gray-600">{report.description}</p>
                  <p className={report.status === "collected" ? "text-green-600 font-medium" : "text-orange-500 font-medium"}>
                    Status: {report.status}
                  </p>
                  {report.status === "pending" && (
                    <button
                      onClick={() => markCollected(report.id)}
                      className="mt-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      ✓ Mark Collected
                    </button>
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
