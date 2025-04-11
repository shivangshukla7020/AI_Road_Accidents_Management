import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Incident, IncidentStatusType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatSeverity, getSeverityColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface IncidentCardProps {
  incident: Incident;
  onViewDetails: () => void;
}

export default function IncidentCard({ incident, onViewDetails }: IncidentCardProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const dispatchMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/incidents/${incident.id}/status`, { 
        status: IncidentStatusType.DISPATCHED 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/active'] });
      toast({
        title: "Emergency services dispatched",
        description: `For incident #${incident.incidentId}`,
      });
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
      await apiRequest("PATCH", `/api/incidents/${incident.id}/status`, { 
        status: IncidentStatusType.CANCELED 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/incidents/active'] });
      toast({
        title: "Incident cancelled",
        description: `Incident #${incident.incidentId} marked as false alarm`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to cancel incident",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  });

  const severity = formatSeverity(incident.severity);
  const severityColor = getSeverityColor(incident.severity);
  const detectedTime = incident.detectedAt ? formatDistanceToNow(new Date(incident.detectedAt), { addSuffix: true }) : 'Unknown';
  
  const handleDispatch = () => {
    dispatchMutation.mutate();
  };
  
  const handleCancel = () => {
    cancelMutation.mutate();
  };

  return (
    <Card className={`overflow-hidden border-l-4 ${severityColor.border}`}>
      <div className={`p-4 ${severityColor.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className={`w-4 h-4 ${severityColor.dot} rounded-full mr-2 animate-pulse`}></div>
            <span className={`font-semibold ${severityColor.text} mr-2`}>{severity} Severity</span>
            <span className="text-sm text-gray-500">ID: #{incident.incidentId}</span>
          </div>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            <span>Detected: {detectedTime}</span>
            <span className="mx-2">|</span>
            <span>Source: {incident.source}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            {incident.hasSnapshot ? (
              <div 
                className="h-48 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={onViewDetails}
              >
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                  5 sec snapshot available
                </div>
              </div>
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center p-4">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500 mt-2">Sensor Data Visualization</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-medium text-lg mb-2">{incident.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{incident.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Coordinates</p>
                <p className="font-medium">{incident.coordinates}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Time to Location</p>
                <p className="font-medium">{incident.estimatedTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nearest Hospital</p>
                <p className="font-medium">{incident.nearestHospital}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">Optimized Route</p>
              <p className="text-sm bg-blue-50 p-2 rounded border border-blue-100 mt-1">
                {incident.optimizedRoute}
              </p>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <Button 
                variant="destructive" 
                className="flex items-center"
                onClick={handleDispatch}
                disabled={dispatchMutation.isPending}
              >
                {dispatchMutation.isPending ? (
                  <Loader className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-1" />
                )}
                Dispatch Emergency Services
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader className="w-4 h-4 mr-1 animate-spin" />
                ) : 'Cancel (False Alarm)'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
