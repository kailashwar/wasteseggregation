import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Navigation } from "lucide-react";

type SignupLocation = {
  label: string;
  latitude: number | null;
  longitude: number | null;
};

type Coordinates = { lat: number; lng: number };
type MapClick = { latLng?: { lat: () => number; lng: () => number } };
type MapListener = { remove: () => void };

interface GoogleMapInstance {
  addListener(event: "click", callback: (event: MapClick) => void): MapListener;
  setCenter(position: Coordinates): void;
  setZoom(zoom: number): void;
}

interface GoogleMarkerInstance {
  setMap(map: GoogleMapInstance | null): void;
  setPosition(position: Coordinates): void;
  getPosition(): { lat: () => number; lng: () => number } | undefined;
  addListener(event: "dragend", callback: () => void): MapListener;
}

interface GoogleMapsApi {
  Map: new (
    element: HTMLElement,
    options: { center: Coordinates; zoom: number; clickableIcons: boolean; gestureHandling: string },
  ) => GoogleMapInstance;
  Marker: new (options: { map: GoogleMapInstance; position: Coordinates; draggable: boolean; title: string }) => GoogleMarkerInstance;
}

declare global {
  interface Window {
    google?: { maps: GoogleMapsApi };
    wasteSignupMapReady?: () => void;
  }
}

let mapsApiPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (mapsApiPromise) return mapsApiPromise;

  const apiKey = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
  if (!apiKey) return Promise.reject(new Error("Google Maps is not configured for this site."));

  mapsApiPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const callback = "wasteSignupMapReady";
    window.wasteSignupMapReady = () => {
      if (window.google?.maps?.Map) resolve();
      else reject(new Error("Google Maps could not be loaded."));
    };

    const trackingId = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];
    const params = new URLSearchParams({
      key: apiKey,
      loading: "async",
      callback,
      ...(trackingId ? { channel: trackingId } : {}),
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Maps could not be loaded."));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    mapsApiPromise = null;
    throw error;
  });

  return mapsApiPromise;
}

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const displayCoordinates = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

export function LocationPicker({ value, onChange }: { value: SignupLocation; onChange: (value: SignupLocation) => void }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<GoogleMapInstance | null>(null);
  const marker = useRef<GoogleMarkerInstance | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);

  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then(() => {
        if (active) setMapReady(true);
      })
      .catch((error: unknown) => {
        if (active) setMapError(error instanceof Error ? error.message : "Google Maps could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapElement.current || !window.google?.maps) return;

    const initialPosition = value.latitude !== null && value.longitude !== null
      ? { lat: value.latitude, lng: value.longitude }
      : INDIA_CENTER;
    const map = new window.google.maps.Map(mapElement.current, {
      center: initialPosition,
      zoom: value.latitude !== null ? 16 : 4,
      clickableIcons: false,
      gestureHandling: "cooperative",
    });
    mapInstance.current = map;

    const placeMarker = (position: Coordinates) => {
      const current = valueRef.current;
      const nextLabel = current.label.trim() || displayCoordinates(position.lat, position.lng);
      onChangeRef.current({ ...current, label: nextLabel, latitude: position.lat, longitude: position.lng });
      map.setCenter(position);
      map.setZoom(16);
      if (marker.current) marker.current.setPosition(position);
      else {
        marker.current = new window.google!.maps.Marker({
          map,
          position,
          draggable: true,
          title: "Selected signup location. Drag to adjust.",
        });
        marker.current.addListener("dragend", () => {
          const selected = marker.current?.getPosition();
          if (selected) placeMarker({ lat: selected.lat(), lng: selected.lng() });
        });
      }
    };

    const clickListener = map.addListener("click", (event) => {
      if (event.latLng) placeMarker({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });

    if (value.latitude !== null && value.longitude !== null) placeMarker(initialPosition);

    return () => {
      clickListener.remove();
      marker.current?.setMap(null);
      marker.current = null;
      mapInstance.current = null;
    };
    // The map is initialized once after the Maps script loads. Current selection is updated below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !window.google?.maps) return;
    if (value.latitude === null || value.longitude === null) return;
    const position = { lat: value.latitude, lng: value.longitude };
    mapInstance.current.setCenter(position);
    mapInstance.current.setZoom(16);
    if (marker.current) marker.current.setPosition(position);
    else {
      marker.current = new window.google.maps.Marker({
        map: mapInstance.current,
        position,
        draggable: true,
        title: "Selected signup location. Drag to adjust.",
      });
      marker.current.addListener("dragend", () => {
        const selected = marker.current?.getPosition();
        if (selected) {
          const current = valueRef.current;
          onChangeRef.current({
            ...current,
            latitude: selected.lat(),
            longitude: selected.lng(),
          });
        }
      });
    }
  }, [mapReady, value.latitude, value.longitude]);

  const detectLocation = () => {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Location services are unavailable in this browser. Enter a landmark or choose a point on the map.");
      return;
    }

    setLocating(true);
    setLocationMessage("Allow location access when your browser asks.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        const current = valueRef.current;
        onChangeRef.current({
          ...current,
          label: current.label.trim() || `Current location · ${displayCoordinates(position.lat, position.lng)}`,
          latitude: position.lat,
          longitude: position.lng,
        });
        setLocationMessage("Location detected. Review the pin and drag it to adjust if needed.");
        setLocating(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage("Location permission was denied. Enable it in your browser settings, or enter a landmark and choose a point on the map.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationMessage("Your location is unavailable right now. Enter a landmark or choose a point on the map.");
        } else if (error.code === error.TIMEOUT) {
          setLocationMessage("Location detection timed out. Try again or choose a point on the map.");
        } else {
          setLocationMessage("We could not detect your location. Enter a landmark or choose a point on the map.");
        }
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={detectLocation}
        disabled={locating}
        className="h-10 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        {locating ? "Detecting location…" : "Use my current location"}
      </Button>

      <div className="relative h-52 w-full overflow-hidden rounded-xl border border-white/15 bg-white/5 sm:h-56">
        {mapError ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/65" role="status">
            <div>
              <MapPin className="mx-auto mb-2 h-5 w-5 text-fuchsia-300" />
              {mapError} Enter a landmark above; your signup can still continue.
            </div>
          </div>
        ) : !mapReady ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-white/60" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading map…
          </div>
        ) : null}
        <div ref={mapElement} className={`h-full w-full ${mapReady && !mapError ? "block" : "hidden"}`} aria-label="Google Map for choosing your location" />
      </div>

      {value.latitude !== null && value.longitude !== null && (
        <p className="text-xs text-white/55" aria-live="polite">
          Map pin: {displayCoordinates(value.latitude, value.longitude)}
        </p>
      )}
      {locationMessage && <p className="text-xs text-white/65" role="status">{locationMessage}</p>}
      {!locationMessage && !mapError && <p className="text-xs text-white/45">Your location is only requested when you choose the button above.</p>}
    </div>
  );
}