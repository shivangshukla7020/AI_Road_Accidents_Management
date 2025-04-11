import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import LiveFeedPage from "@/pages/LiveFeedPage";
import IncidentHistoryPage from "@/pages/IncidentHistory";
import { useState, useEffect } from "react";
import { AuthProvider } from "./lib/hooks";
import { IncidentModalProvider, useIncidentModal } from "@/context/IncidentalModelContext";
import IncidentDetailModal from "@/components/modals/IncidentDetailModal";
import { useIncidentAllListener } from "@/hooks/useIncidentAIListener";
import { IncidentProvider } from "@/lib/accident-alert-context";

// ✅ NEW MapProvider import
import { MapProvider } from "@/context/MapContext";

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const isAuth = !!storedUser;
    setIsAuthenticated(isAuth);

    if (!isAuth && location !== "/login") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={DashboardPage} />
      <Route path="/live-feed" component={LiveFeedPage} />
      <Route path="/incidents" component={IncidentHistoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <IncidentProvider>
          <IncidentModalProvider>
            <MapProvider> {/* ✅ WRAP IT HERE */}
              <GlobalIncidentHandler />
              <Router />
              <GlobalIncidentModal />
              <Toaster />
            </MapProvider>
          </IncidentModalProvider>
        </IncidentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function GlobalIncidentHandler() {
  useIncidentAllListener();
  return null;
}

function GlobalIncidentModal() {
  const { incident, closeModal } = useIncidentModal();
  return (
    <IncidentDetailModal
      incident={incident}
      isOpen={!!incident}
      onClose={closeModal}
    />
  );
}

export default App;
