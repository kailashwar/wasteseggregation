import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const wasteReports = [
  { id: 1, lat: 12.9716, lng: 77.5946, location: "MG Road, Bangalore", status: "pending" },
  { id: 2, lat: 19.0896, lng: 72.8656, location: "Juhu Beach, Mumbai", status: "collected" },
  { id: 3, lat: 28.6315, lng: 77.2167, location: "Connaught Place, Delhi", status: "pending" },
  { id: 4, lat: 13.0499, lng: 80.2824, location: "Marina Beach, Chennai", status: "collected" },
  { id: 5, lat: 12.9784, lng: 77.6408, location: "Indiranagar, Bangalore", status: "pending" },
];

export default function MapView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-heading font-bold">Waste Map</h2>
        <p className="text-muted-foreground text-sm mt-1">
          View reported plastic waste locations across India
        </p>
      </div>

      <div className="flex gap-3 mb-2">
        <span className="text-xs px-3 py-1.5 rounded-full bg-warning/10 text-warning font-medium">
          ● Pending: {wasteReports.filter((r) => r.status === "pending").length}
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success font-medium">
          ● Collected: {wasteReports.filter((r) => r.status === "collected").length}
        </span>
      </div>

      <div className="glass-card rounded-lg overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {wasteReports.map((report) => (
            <Marker key={report.id} position={[report.lat, report.lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{report.location}</p>
                  <p className={report.status === "collected" ? "text-green-600" : "text-orange-500"}>
                    Status: {report.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
