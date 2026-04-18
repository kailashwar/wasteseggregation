import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoadingScreen } from "@/components/LoadingScreen";
import Dashboard from "./pages/Dashboard";
import UserHome from "./pages/UserHome";
import MapView from "./pages/MapView";
import ReportWaste from "./pages/ReportWaste";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import MyCredits from "./pages/MyCredits";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Auth />;

  const isAdmin = role === "admin";

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={isAdmin ? <Dashboard /> : <UserHome />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/report" element={<ReportWaste />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/credits" element={<MyCredits />} />
        {isAdmin && <Route path="/analytics" element={<Analytics />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
}

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!splashDone && <LoadingScreen onDone={() => setSplashDone(true)} />}
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
