import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Recycle, LogIn, UserPlus, Loader2 } from "lucide-react";
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

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-primary via-accent to-success">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-warning/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary/50 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />

      <div className="relative w-full max-w-sm space-y-6 animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center shadow-lg">
            <Recycle className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white drop-shadow">Plastic Waste Segregation</h1>
          <p className="text-sm text-white/90 text-center">
            {isSignup ? "Create an account to report street garbage" : "Login to manage cleanup reports"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4 bg-card/95 backdrop-blur-xl border border-white/30 shadow-2xl">
          {isSignup && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                maxLength={50}
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              maxLength={255}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              maxLength={100}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isSignup ? (
              <UserPlus className="h-4 w-4 mr-2" />
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            {isSignup ? "Sign Up" : "Login"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignup(!isSignup); setError(""); }}
              className="text-primary font-medium hover:underline"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            The first account created becomes the admin.
          </p>
        </form>
      </div>
    </div>
  );
}
