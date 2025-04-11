import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Filter, Plus, Minus } from "lucide-react";
import { Incident } from "../../../shared/schema";
import { useState, useEffect, useRef } from "react";
import { getSeverityColor } from "@/lib/utils";
import { useLayout } from "./Layout";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

interface IncidentMapProps {
  incidents: Incident[];
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

export default function IncidentMap({ incidents }: IncidentMapProps) {
  const [zoom, setZoom] = useState(14);
  const { isFullMapView } = useLayout();
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default SF
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyC484gFvk0g6SGNm88CmoZF9CVH7XwfNcg", // replace with your actual API key
  });

  // Auto center to latest incident
  useEffect(() => {
    if (incidents.length > 0) {
      const lastIncident = incidents[incidents.length - 1];
      if (lastIncident.coordinates) {
        const [latStr, lngStr] = lastIncident.coordinates.split(",");
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (!isNaN(lat) && !isNaN(lng)) {
          const newCenter = { lat, lng };
          setCenter(newCenter);
          mapRef.current?.panTo(newCenter);
          setZoom(16); // adjust zoom when focusing on new incident
        }
      }
    }
  }, [incidents]);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setCenter({ lat: 37.7749, lng: -122.4194 }) // fallback to SF
      );
    }
  }, []);

  if (loadError) {
    return (
      <div className="p-4 text-red-500">
        Error loading maps. Please check your API key and network connection.
      </div>
    );
  }

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  const mapContent = (
    <div className={`map-container relative ${isFullMapView ? "h-full" : "h-[400px]"}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={zoom}
        center={center}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {incidents.map((incident) => {
          if (!incident.coordinates) return null;
          const [latStr, lngStr] = incident.coordinates.split(",");
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (isNaN(lat) || isNaN(lng)) return null;

          const severityColor = getSeverityColor(incident.severity);
          return (
            <Marker
              key={incident.id}
              position={{ lat, lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: severityColor.dot,
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 10,
              }}
              title={incident.title}
            />
          );
        })}
      </GoogleMap>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md z-10">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => setZoom((prev) => Math.min(prev + 1, 18))}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 p-0"
            onClick={() => setZoom((prev) => Math.max(prev - 1, 3))}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isFullMapView) {
    return mapContent;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-gray-800 text-white flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">Incident Map</CardTitle>
        <div className="flex space-x-2">
          <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600">
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">{mapContent}</CardContent>
    </Card>
  );
}
