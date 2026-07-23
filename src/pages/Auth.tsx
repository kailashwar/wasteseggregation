import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, LogIn, UserPlus, Loader2, Mail, User, KeyRound } from "lucide-react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

const signUpSchema = signInSchema.extend({
  username: z.string().trim().min(2, { message: "Username must be at least 2 characters" }).max(50),
});

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = (e.clientX / w - 0.5) * 2;
      const y = (e.clientY / h - 0.5) * 2;
      setTilt({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = isSignup
      ? signUpSchema.safeParse({ email, password, username })
      : signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const err = isSignup
      ? await signUp(email, password, username)
      : await signIn(email, password);
    setSubmitting(false);
    if (err) setError(err);
  };

  // binary strings for background
  const binaryColumns = Array.from({ length: 18 });

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#03060d]"
      style={{ perspective: "1200px" }}
    >
      {/* Digital grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          animation: "grid-pan 20s linear infinite",
        }}
      />

      {/* Radial glows */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px]" />

      {/* Hex pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse">
            <polygon
              points="30,2 56,17 56,45 30,60 4,45 4,17"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      {/* Binary rain */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {binaryColumns.map((_, i) => (
          <div
            key={i}
            className="absolute top-0 text-[10px] font-mono text-emerald-400/30 whitespace-pre leading-4"
            style={{
              left: `${(i / binaryColumns.length) * 100}%`,
              animation: `binary-fall ${8 + (i % 6)}s linear ${i * 0.4}s infinite`,
            }}
          >
            {Array.from({ length: 40 })
              .map(() => (Math.random() > 0.5 ? "1" : "0"))
              .join("\n")}
          </div>
        ))}
      </div>

      {/* Matrix particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-300/70 shadow-[0_0_8px_rgba(0,229,255,0.9)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Floating shields */}
      {[
        { left: "8%", top: "20%", d: 0 },
        { left: "88%", top: "30%", d: 1.2 },
        { left: "12%", top: "75%", d: 2.4 },
        { left: "85%", top: "78%", d: 0.6 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-cyan-400/40"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 6, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield className="h-10 w-10 drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]" />
        </motion.div>
      ))}

      {/* Scanning line */}
      <div
        className="absolute inset-x-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(0,229,255,0.15), transparent)",
          animation: "scan 5s linear infinite",
        }}
      />

      {/* Holographic panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full max-w-md"
        style={{
          transform: `rotateY(${tilt.x * 6}deg) rotateX(${-tilt.y * 6}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 200ms ease-out",
        }}
      >
        {/* Hologram lock icon */}
        <motion.div
          className="absolute left-1/2 -top-12 -translate-x-1/2 z-10"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "translateZ(60px) translateX(-50%)" }}
        >
          <div className="relative h-24 w-24 rounded-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-emerald-400/40" />
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-cyan-300/60 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.6)]">
              <Lock className="h-7 w-7 text-cyan-200 drop-shadow-[0_0_8px_rgba(0,229,255,1)]" />
            </div>
          </div>
        </motion.div>

        {/* Panel */}
        <div className="relative mt-14 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl p-8 pt-14 shadow-[0_0_60px_rgba(0,229,255,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
          {/* Corner brackets */}
          {[
            "top-2 left-2 border-t border-l",
            "top-2 right-2 border-t border-r",
            "bottom-2 left-2 border-b border-l",
            "bottom-2 right-2 border-b border-r",
          ].map((c, i) => (
            <span key={i} className={`absolute h-4 w-4 border-cyan-400/70 ${c}`} />
          ))}

          {/* Inner scan */}
          <div
            className="absolute inset-x-0 h-16 pointer-events-none opacity-70"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(16,255,180,0.12), transparent)",
              animation: "scan-inner 4s linear infinite",
            }}
          />

          <div className="text-center mb-6 relative">
            <p className="text-[10px] tracking-[0.4em] text-cyan-300/80 font-mono">
              SECURE ACCESS TERMINAL
            </p>
            <h1 className="mt-2 text-2xl font-heading font-bold bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent drop-shadow">
              {isSignup ? "Create Identity" : "Authenticate"}
            </h1>
            <p className="mt-1 text-xs text-cyan-100/60 font-mono">
              {isSignup ? "// register new operator" : "// verify credentials to proceed"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {isSignup && (
              <CyberInput
                icon={<User className="h-4 w-4" />}
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="operator_alias"
                maxLength={50}
              />
            )}
            <CyberInput
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="user@domain.net"
              maxLength={255}
              autoFocus
            />
            <CyberInput
              icon={<KeyRound className="h-4 w-4" />}
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              maxLength={100}
            />

            {error && (
              <p className="text-xs font-mono text-red-400 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full h-12 rounded-lg font-mono text-sm tracking-[0.2em] uppercase text-cyan-50 border border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 hover:from-cyan-500/40 hover:to-emerald-500/40 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all overflow-hidden disabled:opacity-60"
            >
              <span className="absolute inset-0 rounded-lg animate-[pulse-ring_2.2s_ease-out_infinite] border border-cyan-300/60" />
              <span className="relative flex items-center justify-center gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSignup ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isSignup ? "Initialize" : "Access System"}
              </span>
            </button>

            <p className="text-center text-xs font-mono text-cyan-100/60">
              {isSignup ? "identity exists?" : "no identity registered?"}{" "}
              <button
                type="button"
                onClick={() => { setIsSignup(!isSignup); setError(""); }}
                className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
              >
                {isSignup ? "authenticate" : "register"}
              </button>
            </p>
            <p className="text-center text-[10px] tracking-widest font-mono text-cyan-100/40">
              ENCRYPTED • END-TO-END • v2.0
            </p>
          </form>
        </div>
      </motion.div>

      <style>{`
        @keyframes grid-pan {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 48px 48px, 48px 48px; }
        }
        @keyframes binary-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(120vh); opacity: 0; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0,0); opacity: 0.3; }
          50% { transform: translate(20px, -30px); opacity: 1; }
        }
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes scan-inner {
          0% { top: -20%; }
          100% { top: 120%; }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0,229,255,0.6); opacity: 1; }
          100% { box-shadow: 0 0 0 14px rgba(0,229,255,0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function CyberInput({
  icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
  autoFocus,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
}) {
  return (
    <div className="group">
      <label className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase text-cyan-300/80 mb-1.5">
        {icon} {label}
      </label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className="bg-black/40 border-cyan-400/30 text-cyan-50 placeholder:text-cyan-100/30 font-mono focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400/70 focus-visible:shadow-[0_0_20px_rgba(16,255,180,0.4)] transition-all h-11"
        />
        <span className="pointer-events-none absolute inset-0 rounded-md border border-transparent group-focus-within:border-emerald-400/40 group-focus-within:shadow-[inset_0_0_12px_rgba(0,229,255,0.3)]" />
      </div>
    </div>
  );
}
