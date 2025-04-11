// @/lib/accident-alert-context.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for an incident
interface Incident {
  id: number;
  incidentId: string;
  title: string;
  description: string;
  severity: string;
  source: string;
  location: string;
  coordinates: string;
  status: string;
  hasSnapshot: boolean;
  detectedAt: Date;
  createdAt: Date;
  estimatedTime: string | null;
  nearestHospital: string | null;
  optimizedRoute: string;
  snapshotUrl: string;
}

interface IncidentContextProps {
  incident: Incident | null;
  setIncident: (incident: Incident) => void;
}

const IncidentContext = createContext<IncidentContextProps | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incident, setIncident] = useState<Incident | null>(null);

  return (
    <IncidentContext.Provider value={{ incident, setIncident }}>
      {children}
    </IncidentContext.Provider>
  );
};

// Custom hook to use the incident context
export const useIncidentAlert = (): IncidentContextProps => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidentAlert must be used within an IncidentProvider");
  }
  return context;
};
