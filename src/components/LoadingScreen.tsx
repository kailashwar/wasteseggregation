import { useEffect, useState } from "react";
import whiteDevils from "@/assets/white-devils.jpg";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 5000) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        onDone();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]">
      <div className="relative w-full max-w-3xl px-6">
        <img
          src={whiteDevils}
          alt="White Devils — Waste Segregation"
          className="w-full rounded-xl shadow-[0_0_80px_rgba(56,189,248,0.4)]"
        />
        <div className="mt-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-wide text-white">
            Waste Segregation
          </h1>
          <p className="mt-2 text-sm text-sky-300/80">Loading your clean-up dashboard…</p>
        </div>
        <div className="mt-6 mx-auto h-1.5 w-64 overflow-hidden rounded-full bg-sky-900/50">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
