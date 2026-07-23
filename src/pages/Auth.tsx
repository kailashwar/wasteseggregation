import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Shield, Lock, LogIn, UserPlus, Loader2, Mail, User, KeyRound, Sparkles, Fingerprint } from "lucide-react";
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

  // ----- Mouse tilt (spring-physics) -----
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 15, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 15, mass: 0.4 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [12, -12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["10%", "90%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["10%", "90%"]);

  const onMove = (e: React.MouseEvent) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  // Ambient orbs follow cursor slowly
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cx = useSpring(cursorX, { stiffness: 40, damping: 20 });
  const cy = useSpring(cursorY, { stiffness: 40, damping: 20 });
  useEffect(() => {
    const h = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [cursorX, cursorY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = isSignup
      ? signUpSchema.safeParse({ email, password, username })
      : signInSchema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setSubmitting(true);
    const err = isSignup ? await signUp(email, password, username) : await signIn(email, password);
    setSubmitting(false);
    if (err) setError(err);
  };

  // Particles (memoized so they don't re-jitter on re-renders)
  const particles = useMemo(
    () => Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 6,
      duration: 8 + Math.random() * 10,
      hue: Math.random() > 0.5 ? "#a78bfa" : "#38bdf8",
    })),
    []
  );

  return (
    <div className="dark relative min-h-screen w-full overflow-hidden bg-[#05060f] text-white flex items-center justify-center px-4 py-10">
      {/* AURORA BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -top-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full opacity-70 mix-blend-screen"
          style={{ background: "radial-gradient(circle at center, #7c3aed 0%, transparent 60%)", filter: "blur(80px)" }}
          animate={{ x: [0, 60, -40, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/4 -right-1/4 h-[70vh] w-[70vh] rounded-full opacity-60 mix-blend-screen"
          style={{ background: "radial-gradient(circle at center, #0ea5e9 0%, transparent 60%)", filter: "blur(90px)" }}
          animate={{ x: [0, -50, 30, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-1/3 left-1/3 h-[75vh] w-[75vh] rounded-full opacity-60 mix-blend-screen"
          style={{ background: "radial-gradient(circle at center, #ec4899 0%, transparent 60%)", filter: "blur(100px)" }}
          animate={{ x: [0, 40, -60, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Noise / grain */}
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* Cursor-follow ambient glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[380px] w-[380px] rounded-full"
        style={{
          x: useTransform(cx, (v) => v - 190),
          y: useTransform(cy, (v) => v - 190),
          background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(56,189,248,0.12) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* Particle system */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.hue,
              boxShadow: `0 0 ${6 + p.size * 3}px ${p.hue}`,
            }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Floating 3D icons (parallax with mouse) */}
      <FloatingIcon className="left-[6%] top-[18%] text-fuchsia-300/70" delay={0} depth={40} cx={cx} cy={cy}>
        <Sparkles className="h-8 w-8" />
      </FloatingIcon>
      <FloatingIcon className="right-[8%] top-[22%] text-cyan-300/70" delay={1.2} depth={-60} cx={cx} cy={cy}>
        <Shield className="h-10 w-10" />
      </FloatingIcon>
      <FloatingIcon className="left-[10%] bottom-[16%] text-violet-300/70" delay={2.1} depth={-30} cx={cx} cy={cy}>
        <Fingerprint className="h-10 w-10" />
      </FloatingIcon>
      <FloatingIcon className="right-[10%] bottom-[20%] text-sky-300/70" delay={0.6} depth={50} cx={cx} cy={cy}>
        <Lock className="h-8 w-8" />
      </FloatingIcon>

      {/* CARD */}
      <div style={{ perspective: 1400 }} className="relative w-full max-w-md z-10">
        <motion.div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          initial={{ opacity: 0, y: 40, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.1 }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative rounded-3xl"
        >
          {/* Gradient border shell */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-fuchsia-500/50 via-violet-500/40 to-cyan-400/50 opacity-70 blur-[1px]" />
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/20 via-transparent to-cyan-500/20 blur-2xl" />

          {/* Glass panel */}
          <div
            className="relative rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-2xl p-8 pt-14 shadow-[0_30px_80px_-20px_rgba(80,20,180,0.55)] overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Moving glare */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([x, y]) =>
                    `radial-gradient(600px circle at ${x} ${y}, rgba(255,255,255,0.25), transparent 55%)`
                ) as never,
              }}
            />

            {/* Floating logo (3D-lifted) */}
            <motion.div
              className="absolute left-1/2 -top-10 -translate-x-1/2"
              style={{ transform: "translateZ(70px) translateX(-50%)" }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 blur-xl opacity-70" />
                <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(139,92,246,0.7)] ring-1 ring-white/30">
                  <Lock className="h-9 w-9 text-white drop-shadow" />
                </div>
              </div>
            </motion.div>

            {/* Header */}
            <div className="text-center mb-6" style={{ transform: "translateZ(30px)" }}>
              <p className="text-[10px] tracking-[0.5em] uppercase text-white/50">Waste Segregation</p>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={isSignup ? "up" : "in"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 text-3xl font-heading font-bold bg-gradient-to-r from-white via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent"
                >
                  {isSignup ? "Create your account" : "Welcome back"}
                </motion.h1>
              </AnimatePresence>
              <p className="mt-2 text-sm text-white/60">
                {isSignup ? "Join the mission for cleaner streets" : "Sign in to continue your journey"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" style={{ transform: "translateZ(20px)" }}>
              <AnimatePresence initial={false}>
                {isSignup && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FloatField id="username" label="Username" icon={<User className="h-4 w-4" />} value={username} onChange={setUsername} maxLength={50} />
                  </motion.div>
                )}
              </AnimatePresence>
              <FloatField id="email" label="Email" type="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} maxLength={255} autoFocus />
              <FloatField id="password" label="Password" type="password" icon={<KeyRound className="h-4 w-4" />} value={password} onChange={setPassword} maxLength={100} />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-rose-300 border border-rose-500/30 bg-rose-500/10 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="group relative w-full h-12 rounded-xl font-medium text-white overflow-hidden disabled:opacity-70"
                style={{ transform: "translateZ(30px)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" />
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
                <span
                  className="absolute inset-0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-out"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSignup ? (
                    <UserPlus className="h-4 w-4" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {isSignup ? "Create account" : "Sign in"}
                </span>
              </motion.button>

              <p className="text-center text-sm text-white/60">
                {isSignup ? "Already have an account?" : "New here?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignup(!isSignup); setError(""); }}
                  className="font-medium bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent hover:opacity-80"
                >
                  {isSignup ? "Sign in" : "Create one"}
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Floating label field ---------- */
function FloatField({
  id, label, value, onChange, type = "text", icon, maxLength, autoFocus,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  type?: string; icon: React.ReactNode; maxLength?: number; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <div className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${active ? "text-fuchsia-300" : "text-white/50"}`}>
        {icon}
      </div>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="peer h-12 pl-10 pr-3 bg-white/5 border-white/15 text-white placeholder-transparent focus-visible:ring-2 focus-visible:ring-fuchsia-400/50 focus-visible:border-fuchsia-400/50 transition-all"
        placeholder={label}
      />
      <motion.label
        htmlFor={id}
        initial={false}
        animate={{
          y: active ? -22 : 0,
          scale: active ? 0.82 : 1,
          x: active ? -8 : 0,
          color: active ? "rgb(240 171 252)" : "rgba(255,255,255,0.55)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 origin-left text-sm bg-transparent px-1"
      >
        {label}
      </motion.label>
      {active && (
        <span className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-fuchsia-400/20 shadow-[0_0_25px_rgba(217,70,239,0.15)]" />
      )}
    </div>
  );
}

/* ---------- Floating icon w/ parallax + gentle float ---------- */
function FloatingIcon({
  children, className = "", delay = 0, depth = 30, cx, cy,
}: {
  children: React.ReactNode; className?: string; delay?: number; depth?: number;
  cx: ReturnType<typeof useSpring>; cy: ReturnType<typeof useSpring>;
}) {
  const tx = useTransform(cx, (v) => ((v / window.innerWidth) - 0.5) * depth);
  const ty = useTransform(cy, (v) => ((v / window.innerHeight) - 0.5) * depth);
  return (
    <motion.div
      className={`absolute hidden md:block ${className} drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]`}
      style={{ x: tx, y: ty }}
      animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
