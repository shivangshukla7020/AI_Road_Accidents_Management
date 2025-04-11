import { useQuery } from "@tanstack/react-query";
import { Incident, EmergencyContact } from "../../../shared/schema";
import DashboardHeader from "./DashboardHeader";
import EmergencyContacts from "./EmergencyContacts";
import IncidentCard from "./IncidentCard";
import IncidentMap from "./IncidentMap";
import SystemStatus from "./SystemStatus";
import { useLayout } from "./Layout";
import { useIncidentModal } from "@/context/IncidentalModelContext"; // import your new context
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";

export default function Dashboard() {
  const { isFullMapView } = useLayout();
  const { openModal } = useIncidentModal();

  // Fetch active incidents
  const { data: incidents, isLoading: isLoadingIncidents } = useQuery<Incident[]>({
    queryKey: ['/api/incidents/active'],
  });

  // Fetch emergency contacts
  const { data: contacts } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
  });

  const handleViewIncidentDetails = (incident: Incident) => {
    openModal(incident);
  };

  // Full map view layout
  if (isFullMapView) {
    return (
      <div className="flex-1 overflow-hidden h-full flex flex-col">
        {/* Full-screen map */}
        <div className="flex-1 relative">
          <IncidentMap incidents={incidents || []} />
          
          {/* Floating incidents panel */}
          <div className="absolute bottom-4 right-4 max-w-md">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg p-3 max-h-60 overflow-y-auto">
              <h3 className="text-sm font-semibold mb-2">
                Active Incidents ({incidents?.length || 0})
              </h3>
              
              {isLoadingIncidents ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : incidents && incidents.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {incidents.map((incident) => (
                    <div 
                      key={incident.id}
                      className="p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewIncidentDetails(incident)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          incident.severity === 'high' 
                            ? 'bg-red-500' 
                            : incident.severity === 'medium' 
                              ? 'bg-yellow-500' 
                              : 'bg-blue-500'
                        }`} />
                        <p className="text-sm font-medium truncate">{incident.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{incident.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center p-4">No active incidents</p>
              )}
            </Card>
          </div>
          
          {/* Floating emergency contacts panel */}
          <div className="absolute bottom-4 left-4">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg p-3">
              <h3 className="text-sm font-semibold mb-2">Emergency Contacts</h3>
              <div className="flex gap-2">
                {contacts?.slice(0, 2).map((contact) => (
                  <Button 
                    key={contact.id}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <PhoneCall className="h-3 w-3" />
                    <span className="text-xs">{contact.name}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Regular dashboard layout
  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
      <DashboardHeader 
        activeIncidentsCount={incidents?.length || 0} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Map Column */}
        <div className="lg:col-span-2">
          <IncidentMap incidents={incidents || []} />
        </div>

        {/* Emergency Contacts & System Status Column */}
        <div className="lg:col-span-1">
          <EmergencyContacts />
          <div className="mt-6">
            <SystemStatus />
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Active Incidents</h3>
        {isLoadingIncidents ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : incidents && incidents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {incidents.map((incident) => (
              <IncidentCard 
                key={incident.id} 
                incident={incident} 
                onViewDetails={() => handleViewIncidentDetails(incident)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <p className="text-gray-500">No active incidents at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
