import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "user";

interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => string | null;
  signup: (username: string, password: string) => string | null;
  logout: () => void;
}

interface StoredUser {
  username: string;
  password: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([
    { username: "admin", password: "123", role: "admin" },
  ]);

  const login = (username: string, password: string): string | null => {
    const found = users.find((u) => u.username === username && u.password === password);
    if (found) {
      setUser({ username: found.username, role: found.role });
      return null;
    }
    return "Invalid username or password";
  };

  const signup = (username: string, password: string): string | null => {
    if (username.trim().length < 3) return "Username must be at least 3 characters";
    if (password.length < 3) return "Password must be at least 3 characters";
    if (users.find((u) => u.username === username)) return "Username already exists";
    const newUser: StoredUser = { username, password, role: "user" };
    setUsers((prev) => [...prev, newUser]);
    setUser({ username, role: "user" });
    return null;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
