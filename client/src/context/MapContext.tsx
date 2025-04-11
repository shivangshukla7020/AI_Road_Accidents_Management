import { createContext, useContext, useState, ReactNode } from "react";

interface MapContextType {
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map) => void;
  focusMap: (lat: number, lng: number, zoom?: number) => void;
  addMarker: (lat: number, lng: number) => void;
  clearMarkers: () => void; // Optional: clear old markers
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]); // Track markers

  const setMap = (map: google.maps.Map) => {
    setMapInstance(map);
  };

  const focusMap = (lat: number, lng: number, zoom = 16) => {
    if (map) {
      const center = new google.maps.LatLng(lat, lng);
      map.panTo(center);
      map.setZoom(zoom);
    }
  };

  const addMarker = (lat: number, lng: number) => {
    if (map) {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Incident Detected",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      setMarkers((prev) => [...prev, marker]);
    }
  };

  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null)); // Remove from map
    setMarkers([]); // Clear state
  };

  return (
    <MapContext.Provider value={{ map, setMap, focusMap, addMarker, clearMarkers }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}
