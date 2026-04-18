import { QRCodeSVG } from "qrcode.react";
import { Coins, Camera, User as UserIcon, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function MyCredits() {
  const { user, username, credits, photoCount } = useAuth();

  if (!user) return null;

  const profilePayload = JSON.stringify({
    type: "ps_profile",
    user_id: user.id,
    username,
  });

  const creditsPayload = JSON.stringify({
    type: "ps_credits",
    user_id: user.id,
    username,
    credits,
    photos: photoCount,
    issued_at: new Date().toISOString().slice(0, 10),
  });

  const photosToNext = photoCount % 2 === 0 ? 2 : 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">My Credits & QR Codes</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Earn 1 credit for every 2 photos you upload. Show your QR codes for verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-lg p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Credits</p>
            <p className="text-2xl font-bold">{credits}</p>
          </div>
        </div>
        <div className="glass-card rounded-lg p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Photos uploaded</p>
            <p className="text-2xl font-bold">{photoCount}</p>
          </div>
        </div>
        <div className="glass-card rounded-lg p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Photos to next credit</p>
            <p className="text-2xl font-bold">{photosToNext}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-lg p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold">Profile QR</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Scan to view this user's profile and history.
          </p>
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={profilePayload} size={180} level="M" />
          </div>
          <p className="mt-3 text-sm font-medium">{username ?? "User"}</p>
        </div>

        <div className="glass-card rounded-lg p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold">Credits QR</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Scan to verify current credit balance.
          </p>
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={creditsPayload} size={180} level="M" />
          </div>
          <p className="mt-3 text-sm font-medium">
            {credits} credit{credits === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </div>
  );
}
