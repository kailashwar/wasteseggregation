import { useState, useEffect } from "react";
import { Camera, MapPin, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const descriptionSchema = z.string().trim().max(500);

export default function ReportWaste() {
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
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
          setLocationName(`${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
          setLoadingLocation(false);
        },
        () => {
          setLocation({ lat: 13.0627, lng: 80.2707 });
          setLocationName("Default location");
          setLoadingLocation(false);
        }
      );
    } else {
      setLocation({ lat: 13.0627, lng: 80.2707 });
      setLocationName("Default location");
      setLoadingLocation(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 10MB", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image", variant: "destructive" });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!photoFile || !user) {
      toast({ title: "Photo required", description: "Please upload a photo of the garbage", variant: "destructive" });
      return;
    }
    if (!location) {
      toast({ title: "Location required", description: "Please allow location access", variant: "destructive" });
      return;
    }

    const descParsed = descriptionSchema.safeParse(description);
    if (!descParsed.success) {
      toast({ title: "Invalid description", description: descParsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upload photo
      const ext = photoFile.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("report-photos")
        .upload(filePath, photoFile, { contentType: photoFile.type });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from("report-photos")
        .getPublicUrl(filePath);

      // Auto-detect priority from description keywords
      const desc = (descParsed.data || "").toLowerCase();
      const highKeywords = ["plastic", "hazard", "toxic", "medical", "biohazard", "chemical", "large", "huge", "overflow"];
      const lowKeywords = ["small", "minor", "little", "tiny"];
      let priority: "low" | "medium" | "high" = "medium";
      if (highKeywords.some((k) => desc.includes(k))) priority = "high";
      else if (lowKeywords.some((k) => desc.includes(k))) priority = "low";

      // Insert report
      const { error: insErr } = await supabase.from("reports").insert({
        user_id: user.id,
        photo_url: publicUrl,
        lat: location.lat,
        lng: location.lng,
        location_name: locationName || null,
        description: descParsed.data || null,
        priority,
      });
      if (insErr) throw insErr;

      toast({
        title: "Report submitted! 🌱",
        description: "Thanks for helping keep streets clean.",
      });
      setDescription("");
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Submission failed", description: e.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Report Garbage</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Snap a photo and help keep your streets clean
        </p>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Photo *</label>
          {photoPreview ? (
            <div className="relative rounded-lg overflow-hidden">
              <img src={photoPreview} alt="Garbage report preview" className="w-full h-48 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
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
            <button type="button" onClick={captureLocation} className="text-xs text-primary mt-1 hover:underline">
              Refresh location
            </button>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Description (optional)</label>
          <Textarea
            placeholder="Describe what you found..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!photoFile || loadingLocation || submitting}>
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Submit Report
        </Button>
      </div>
    </div>
  );
}
