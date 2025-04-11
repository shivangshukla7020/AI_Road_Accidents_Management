import { createContext, useContext, useState, ReactNode } from 'react';
import { Incident } from '@shared/schema';

interface IncidentModalContextType {
  incident: Incident | null;
  openModal: (incident: Incident) => void;
  closeModal: () => void;
}

const IncidentModalContext = createContext<IncidentModalContextType | undefined>(undefined);

export const IncidentModalProvider = ({ children }: { children: ReactNode }) => {
  const [incident, setIncident] = useState<Incident | null>(null);

  const openModal = (incident: Incident) => setIncident(incident);
  const closeModal = () => setIncident(null);

  return (
    <IncidentModalContext.Provider value={{ incident, openModal, closeModal }}>
      {children}
    </IncidentModalContext.Provider>
  );
};

export const useIncidentModal = () => {
  const context = useContext(IncidentModalContext);
  if (!context) throw new Error('useIncidentModal must be used within IncidentModalProvider');
  return context;
};
