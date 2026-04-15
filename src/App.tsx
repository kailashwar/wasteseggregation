import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WasteProvider } from "@/contexts/WasteContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import ReportWaste from "./pages/ReportWaste";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Login />;
  }

  const isAdmin = user?.role === "admin";

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={isAdmin ? <Dashboard /> : <Navigate to="/report" replace />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/report" element={<ReportWaste />} />
        <Route path="/reports" element={<Reports />} />
        {isAdmin && <Route path="/analytics" element={<Analytics />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <WasteProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </WasteProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
