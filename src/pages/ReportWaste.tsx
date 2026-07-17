import { useState, useEffect, useMemo } from "react";
import { Camera, MapPin, Upload, Loader2, Coins, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const descriptionSchema = z.string().trim().max(500);

type WasteItem = {
  key: string;
  label: string;
  credit: number;
  category: "Plastic" | "Paper" | "Metal" | "Glass" | "E-Waste" | "Organic" | "Other";
};

const WASTE_CATALOG: WasteItem[] = [
  { key: "plastic_bottle_500", label: "Plastic Bottle (500ml)", credit: 0.10, category: "Plastic" },
  { key: "plastic_bottle_large", label: "Large Plastic Bottle", credit: 0.25, category: "Plastic" },
  { key: "plastic_container", label: "Plastic Container", credit: 0.20, category: "Plastic" },
  { key: "plastic_bag", label: "Plastic Bag", credit: 0.05, category: "Plastic" },
  { key: "paper_sheet", label: "Paper Sheet", credit: 0.02, category: "Paper" },
  { key: "newspaper_bundle", label: "Newspaper Bundle", credit: 0.50, category: "Paper" },
  { key: "cardboard_box", label: "Cardboard Box", credit: 1.00, category: "Paper" },
  { key: "aluminium_can", label: "Aluminium Can", credit: 0.50, category: "Metal" },
  { key: "steel_container", label: "Steel Container", credit: 1.50, category: "Metal" },
  { key: "glass_bottle", label: "Glass Bottle", credit: 0.75, category: "Glass" },
  { key: "glass_jar", label: "Glass Jar", credit: 0.50, category: "Glass" },
  { key: "mobile_phone", label: "Mobile Phone", credit: 10, category: "E-Waste" },
  { key: "laptop_component", label: "Laptop Component", credit: 15, category: "E-Waste" },
  { key: "battery", label: "Battery", credit: 2, category: "E-Waste" },
  { key: "electronic_charger", label: "Electronic Charger", credit: 1, category: "E-Waste" },
  { key: "copper_wire", label: "Copper Wire Bundle", credit: 4, category: "Metal" },
  { key: "food_waste", label: "Food Waste (1 kg)", credit: 0.50, category: "Organic" },
  { key: "textile_item", label: "Textile Item", credit: 1.00, category: "Other" },
  { key: "tyre", label: "Tyre", credit: 5, category: "Other" },
];

const CATEGORY_ORDER: WasteItem["category"][] = ["Plastic", "Paper", "Metal", "Glass", "E-Waste", "Organic", "Other"];

export default function ReportWaste() {
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
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

  const setQty = (key: string, next: number) => {
    setQuantities((prev) => {
      const n = Math.max(0, Math.floor(next || 0));
      const copy = { ...prev };
      if (n === 0) delete copy[key];
      else copy[key] = n;
      return copy;
    });
  };

  const { totalCredits, totalItems, selectedItems } = useMemo(() => {
    let credits = 0;
    let items = 0;
    const selected: { item: WasteItem; qty: number; subtotal: number }[] = [];
    for (const item of WASTE_CATALOG) {
      const q = quantities[item.key] || 0;
      if (q > 0) {
        const sub = q * item.credit;
        credits += sub;
        items += q;
        selected.push({ item, qty: q, subtotal: sub });
      }
    }
    return { totalCredits: credits, totalItems: items, selectedItems: selected };
  }, [quantities]);

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
    if (totalItems === 0) {
      toast({ title: "Add items", description: "Select at least one waste item and its quantity.", variant: "destructive" });
      return;
    }

    const descParsed = descriptionSchema.safeParse(description);
    if (!descParsed.success) {
      toast({ title: "Invalid description", description: descParsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const ext = photoFile.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("report-photos")
        .upload(filePath, photoFile, { contentType: photoFile.type });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from("report-photos")
        .getPublicUrl(filePath);

      // Priority: driven by earned credits + description keywords
      const desc = (descParsed.data || "").toLowerCase();
      const highKeywords = ["plastic", "hazard", "toxic", "medical", "biohazard", "chemical", "large", "huge", "overflow"];
      let priority: "low" | "medium" | "high" = "medium";
      if (totalCredits >= 5 || highKeywords.some((k) => desc.includes(k))) priority = "high";
      else if (totalCredits < 1) priority = "low";

      const itemLines = selectedItems
        .map((s) => `• ${s.item.label} × ${s.qty} = ${s.subtotal.toFixed(2)} cr`)
        .join("\n");
      const fullDescription = [
        descParsed.data || "",
        "",
        `Items (${totalItems}):`,
        itemLines,
        `Total earned: ${totalCredits.toFixed(2)} credits`,
      ].join("\n").trim();

      const { error: insErr } = await supabase.from("reports").insert({
        user_id: user.id,
        photo_url: publicUrl,
        lat: location.lat,
        lng: location.lng,
        location_name: locationName || null,
        description: fullDescription,
        priority,
      });
      if (insErr) throw insErr;

      toast({
        title: `🌱 +${totalCredits.toFixed(2)} credits earned!`,
        description: "Thanks for helping keep streets clean.",
      });
      setDescription("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setQuantities({});
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
        <h2 className="text-2xl font-heading font-bold">Report Waste</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Snap a photo, log what you found, and earn credits.
        </p>
      </div>

      <div className="glass-card rounded-lg p-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Photo *</label>
          {photoPreview ? (
            <div className="relative rounded-lg overflow-hidden">
              <img src={photoPreview} alt="Waste report preview" className="w-full h-48 object-cover rounded-lg" />
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
              <span className="text-sm text-muted-foreground">Tap to open camera and capture a live photo</span>
              <span className="text-xs text-muted-foreground/70 mt-1">Gallery uploads are disabled</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                className="hidden"
              />
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

        {/* Item catalog */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">What did you find?</label>
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Coins className="h-3.5 w-3.5" />
              {totalCredits.toFixed(2)} credits
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Enter quantity for each item — credits = qty × per-item value.
          </p>
          <div className="space-y-4">
            {CATEGORY_ORDER.map((cat) => {
              const items = WASTE_CATALOG.filter((i) => i.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat}>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">{cat}</p>
                  <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                    {items.map((item) => {
                      const q = quantities[item.key] || 0;
                      return (
                        <div key={item.key} className="flex items-center gap-2 p-2.5 bg-card/40">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.credit} cr / unit</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setQty(item.key, q - 1)}
                              className="h-7 w-7 rounded-md bg-secondary hover:bg-secondary/80 flex items-center justify-center disabled:opacity-40"
                              disabled={q === 0}
                              aria-label={`Decrease ${item.label}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={q}
                              onChange={(e) => setQty(item.key, parseInt(e.target.value, 10))}
                              className="w-12 h-7 text-center rounded-md bg-background border border-border text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setQty(item.key, q + 1)}
                              className="h-7 w-7 rounded-md bg-primary/15 text-primary hover:bg-primary/25 flex items-center justify-center"
                              aria-label={`Increase ${item.label}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="w-14 text-right text-xs font-medium text-primary">
                            {q > 0 ? (q * item.credit).toFixed(2) : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
          <Textarea
            placeholder="Any extra details about the waste or spot..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
          <span className="text-sm">Total reward</span>
          <span className="text-base font-bold text-primary flex items-center gap-1.5">
            <Coins className="h-4 w-4" /> {totalCredits.toFixed(2)} credits
          </span>
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!photoFile || loadingLocation || submitting || totalItems === 0}>
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Submit Report
        </Button>
      </div>
    </div>
  );
}
