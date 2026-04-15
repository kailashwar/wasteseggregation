import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, signup } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = isSignup ? signup(username, password) : login(username, password);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold">PlasticTrack</h1>
          <p className="text-sm text-muted-foreground text-center">
            {isSignup ? "Create an account to report plastic waste" : "Login to manage waste collection"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-lg p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" size="lg">
            {isSignup ? <UserPlus className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
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

          {!isSignup && (
            <p className="text-center text-xs text-muted-foreground">
              Admin: username <strong>admin</strong>, password <strong>123</strong>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
