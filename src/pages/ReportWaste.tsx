import { useState, useEffect } from "react";
import { Camera, MapPin, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWaste } from "@/contexts/WasteContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ReportWaste() {
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { toast } = useToast();
  const { addReport } = useWaste();
  const { user } = useAuth();

  useEffect(() => {
    captureLocation();
  }, []);

  const captureLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName(`${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
          setLoadingLocation(false);
        },
        () => {
          // Fallback to Chennai center if GPS denied
          setLocation({ lat: 13.0627, lng: 80.2707 });
          setLocationName("Chennai (default)");
          setLoadingLocation(false);
        }
      );
    } else {
      setLocation({ lat: 13.0627, lng: 80.2707 });
      setLocationName("Chennai (default)");
      setLoadingLocation(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image under 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!photo) {
      toast({ title: "Photo required", description: "Please upload a photo of the waste", variant: "destructive" });
      return;
    }
    if (!location) {
      toast({ title: "Location required", description: "Please allow location access", variant: "destructive" });
      return;
    }

    addReport({
      lat: location.lat,
      lng: location.lng,
      location: locationName || "Chennai",
      description: description || "Plastic waste reported",
      status: "pending",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      reporter: user?.username || "Citizen",
      photo: photo,
    });

    toast({
      title: "Report Submitted! 🌱",
      description: "Thank you for helping track plastic waste in Chennai.",
    });
    setDescription("");
    setPhoto(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Report Waste</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Snap a photo of plastic waste and help us track pollution in Chennai
        </p>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-5">
        {/* Photo upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Photo *</label>
          {photo ? (
            <div className="relative rounded-lg overflow-hidden">
              <img src={photo} alt="Waste report" className="w-full h-48 object-cover rounded-lg" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Camera className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to take or upload a photo</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Location</label>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm">
            {loadingLocation ? (
              <>
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span className="text-muted-foreground">Getting your location...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-foreground font-medium">{locationName}</span>
              </>
            )}
          </div>
          {!loadingLocation && (
            <button onClick={captureLocation} className="text-xs text-primary mt-1 hover:underline">
              Refresh location
            </button>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-2 block">Description (optional)</label>
          <Textarea
            placeholder="Describe the waste you found..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!photo || loadingLocation}>
          <Upload className="h-4 w-4 mr-2" />
          Submit Report
        </Button>
      </div>
    </div>
  );
}
