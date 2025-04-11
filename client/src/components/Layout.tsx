import React, { useState, useContext, createContext } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { LucideMaximize2, LucideMinimize2, LucideMenu, LucideX } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export interface LayoutContextType {
  isFullMapView: boolean;
  toggleFullMapView: () => void;
}

// Create a Context to pass down layout state
export const LayoutContext = createContext<LayoutContextType>({
  isFullMapView: false,
  toggleFullMapView: () => {},
});

export const useLayout = () => useContext(LayoutContext);

export default function Layout({ children }: LayoutProps) {
  const [isFullMapView, setFullMapView] = useState(false);
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const toggleFullMapView = () => {
    setFullMapView(!isFullMapView);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <LayoutContext.Provider 
      value={{ 
        isFullMapView, 
        toggleFullMapView 
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for desktop */}
        <div className={`md:flex md:flex-shrink-0`}>
          <Sidebar user={user} onLogout={handleLogout} />
        </div>

        {/* Mobile sidebar */}
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          <div className="fixed inset-y-0 left-0 flex flex-col z-40 w-64 bg-gray-800">
            <Sidebar user={user} onLogout={handleLogout} />
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header with controls */}
          <div className="flex items-center justify-between bg-gray-800 p-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullMapView}
              className="hover:bg-gray-700 border-gray-600"
            >
              {isFullMapView ? (
                <>
                  <LucideMinimize2 className="h-4 w-4 mr-2" />
                  Exit Full Map
                </>
              ) : (
                <>
                  <LucideMaximize2 className="h-4 w-4 mr-2" />
                  Full Map View
                </>
              )}
            </Button>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
