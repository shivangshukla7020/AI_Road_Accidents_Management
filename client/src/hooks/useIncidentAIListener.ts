import { useEffect } from "react";
import { useIncidentModal } from "@/context/IncidentalModelContext";
import { setCooldown, isCooldownActive } from "@/lib/cooldownManager";
import { logDebug } from "@/lib/debug";
import { useMap } from "@/context/MapContext";

export function useIncidentAllListener() {
  const { openModal } = useIncidentModal();
  const { focusMap, addMarker } = useMap();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/incident");

    socket.onmessage = (event) => {
      if (isCooldownActive("ESP32")) return;

      try {
        const incidentData = JSON.parse(event.data);
        logDebug("ESP32 WebSocket received incident:", incidentData);

        const latitude = parseFloat(incidentData.latitude);
        const longitude = parseFloat(incidentData.longitude);

        // Open incident modal
        openModal({
          id: Math.floor(Math.random() * 100000),
          incidentId: incidentData.incident_id || "ESP32-" + Date.now(),
          title: incidentData.incident_type || "Shock Detected",
          description: "ESP32 detected shock with acceleration of " + incidentData.acceleration,
          severity: "high",
          source: "ESP32 Device",
          location: incidentData.address,
          coordinates: `${latitude},${longitude}`,
          estimatedTime: null,
          nearestHospital: null,
          optimizedRoute: "Auto-calculated route",
          status: "active",
          hasSnapshot: false,
          snapshotUrl: "",
          detectedAt: new Date(),
          createdAt: new Date(),
          probability: incidentData.acceleration
            ? Math.min((incidentData.acceleration / 10) * 100, 99.9)
            : null,
        });

        // Focus and mark the location on the map
        if (!isNaN(latitude) && !isNaN(longitude)) {
          focusMap(latitude, longitude);
          addMarker(latitude, longitude);
        }

        setCooldown("ESP32", 5000);
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, [openModal, focusMap, addMarker]);
}
