import { useState } from "react";
import { Camera, MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ReportWaste() {
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Report Submitted!",
      description: "Thank you for helping track plastic waste. Your report has been logged.",
    });
    setDescription("");
    setPhoto(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Report Waste</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Snap a photo of plastic waste and help us track pollution
        </p>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-5">
        {/* Photo upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Photo</label>
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
              <span className="text-sm text-muted-foreground">Click to upload a photo</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Location</label>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">GPS location will be captured automatically</span>
          </div>
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
          />
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          <Upload className="h-4 w-4 mr-2" />
          Submit Report
        </Button>
      </div>
    </div>
  );
}
