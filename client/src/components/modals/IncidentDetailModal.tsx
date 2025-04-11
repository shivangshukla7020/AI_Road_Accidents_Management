import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText } from "lucide-react";
import { Incident, IncidentStatusType } from "@shared/schema";
import { formatSeverity, getSeverityColor } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IncidentDetailModal({ incident, isOpen, onClose }: IncidentDetailModalProps) {
  const { toast } = useToast();

  const dispatchMutation = useMutation({
    mutationFn: async () => {
      if (!incident) return;
      // Dispatch SMS via FastAPI endpoint
      await apiRequest("POST", `http://localhost:8000/dispatch-emergency`, {
        incidentId: incident.incidentId,
        location: incident.location,
        severity: incident.severity,
        detectedAt: incident.detectedAt,
      });
    },
    onSuccess: () => {
      if (!incident) return;
      // queryClient.invalidateQueries({ queryKey: ['/api/incidents/active'] });
      toast({
        title: "Emergency services dispatched",
        description: `SMS sent for incident #${incident.incidentId}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to dispatch emergency services",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!incident) return;
      await apiRequest("PATCH", `/api/incidents/${incident.id}/status`, { 
        status: IncidentStatusType.CANCELED 
      });
    },
    onSuccess: () => {
      if (!incident) return;
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/active'] });
      toast({
        title: "Incident cancelled",
        description: `Incident #${incident.incidentId} marked as false alarm`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to cancel incident",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  });

  const severity = useMemo(() => {
    if (!incident) return "";
    return formatSeverity(incident.severity);
  }, [incident?.severity]);

  const severityColor = useMemo(() => {
    if (!incident) return { dialogHeader: "" };
    return getSeverityColor(incident.severity);
  }, [incident?.severity]);

  if (!incident) return null;

  const detectedTime = incident.detectedAt ? new Date(incident.detectedAt) : new Date();
  const titleText = incident.title ? incident.title.toLowerCase() : "incident";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className={severityColor.dialogHeader}>
          <div className="flex justify-between items-center p-5 bg-blue-500">
            <DialogTitle className="text-white">Incident Details: #{incident.incidentId}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-green-100">
          <div>
            <div className="h-64 bg-gray-300 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
              {incident.hasSnapshot && incident.snapshotUrl ? (
                <>
                  <img
                    src={incident.snapshotUrl}
                    alt="Snapshot"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 bg-black bg-opacity-60 text-xs text-white px-2 py-1 rounded-tr">
                    Live Snapshot
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500 mt-2">Sensor Data Visualization</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Incident Timeline</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">
                      {detectedTime.toLocaleTimeString()} - Incident detected
                    </p>
                    <p className="text-xs text-gray-500">
                      {incident.source || "Unknown source"} reported {titleText}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(detectedTime.getTime() + 25 * 1000).toLocaleTimeString()} - Automated alert triggered
                    </p>
                    <p className="text-xs text-gray-500">Severity rated as {severity.toUpperCase()}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(detectedTime.getTime() + 2 * 60 * 1000).toLocaleTimeString()} - Alert acknowledged
                    </p>
                    <p className="text-xs text-gray-500">Operator: Admin User</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Dispatch button */}
            <Button 
              variant="destructive" 
              className="flex items-center mt-4"
              onClick={() => dispatchMutation.mutate()}
              disabled={dispatchMutation.isPending}
            >
              {dispatchMutation.isPending ? "Dispatching..." : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Dispatch Emergency Services
                </>
              )}
            </Button>
          </div>

          {/* Right Column */}
          <div>
            <h4 className="font-medium text-lg mb-3">
              {incident.title || "Unknown Incident"} - {severity} Severity
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Location & Coordinates</p>
                <p className="font-medium">{incident.location || "Unknown location"}</p>
                <p className="text-sm">{incident.coordinates || "N/A"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Incident Details</p>
                <p>{incident.description || `${incident.title || "An incident"} detected. Emergency response required.`}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Optimized Route</p>
                <p className="text-sm bg-blue-50 p-2 rounded border border-blue-100">
                  {incident.optimizedRoute || "No optimized route available"}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Response Resources</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Ambulance</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Police</Badge>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Traffic Control</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Nearest Emergency Services</p>
                <div className="mt-1 space-y-2">
                  <div className="flex justify-between">
                    <span>City Hospital</span>
                    <span className="text-sm">2.3 miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Police Precinct #4</span>
                    <span className="text-sm">1.8 miles</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col md:flex-row gap-2">
              <Button variant="secondary" className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Generate Report
              </Button>
              <Button 
                variant="outline"
                className="bg-green-500"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel (False Alarm)"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
