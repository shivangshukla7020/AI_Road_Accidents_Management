import { useEffect, useRef, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/hooks";
import { useIncidentAlert } from "@/lib/accident-alert-context";
import { useIncidentModal } from "@/context/IncidentalModelContext";
import { useMap } from "@/context/MapContext"; // ✅ this is your provided MapContext

export default function LiveFeedPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { user, logout } = useAuth();
  const { setIncident } = useIncidentAlert();
  const { openModal } = useIncidentModal();
  const { focusMap } = useMap(); // ✅ using focusMap directly now
  const [probability, setProbability] = useState<number | null>(null);

  const frameBuffer = useRef<{ timestamp: number; image: Blob }[]>([]);
  const cooldownUntil = useRef<number>(0);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const processIncident = useCallback(
    (data: any, snapshotFrames: { timestamp: number; image: Blob }[]) => {
      const now = Date.now();

      const middleFrame = snapshotFrames[Math.floor(snapshotFrames.length / 2)];
      let snapshotUrl = "";
      if (middleFrame) {
        snapshotUrl = URL.createObjectURL(middleFrame.image);
        setTimeout(() => URL.revokeObjectURL(snapshotUrl), 10000);
      }

      const lat = 37.7749; // Example coordinates (San Francisco)
      const lng = -122.4194;

      const incidentData = {
        id: Math.floor(Math.random() * 100000),
        incidentId: "AI-" + now,
        title: data.prediction,
        description: "AI detected possible accident",
        severity: "high",
        source: "AI Detection",
        location: "Auto-detected location",
        coordinates: `${lat},${lng}`,
        status: "active",
        hasSnapshot: !!snapshotUrl,
        detectedAt: new Date(),
        createdAt: new Date(),
        estimatedTime: null,
        nearestHospital: null,
        optimizedRoute: "Auto-calculated route",
        probability: data.accident_probability,
        snapshotUrl,
      };

      setIncident(incidentData);
      openModal(incidentData);
      focusMap(lat, lng, 16); // ✅ auto-focus map when incident is detected
    },
    [setIncident, openModal, focusMap]
  );

  // Frame capture & API call
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (cooldownUntil.current > now) return;

      if (videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              frameBuffer.current.push({ timestamp: now, image: blob });
              frameBuffer.current = frameBuffer.current.filter(
                (frame) => now - frame.timestamp <= 6000
              );

              const formData = new FormData();
              formData.append("file", blob);

              try {
                const response = await fetch("http://localhost:8000/predict", {
                  method: "POST",
                  body: formData,
                });
                const data = await response.json();

                setProbability(data.accident_probability);

                if (data.accident_probability >= 95) {
                  cooldownUntil.current = now + 5000;
                  const snapshotFrames = frameBuffer.current.filter(
                    (frame) => Math.abs(frame.timestamp - now) <= 3000
                  );
                  processIncident(data, snapshotFrames);
                }
              } catch (err) {
                console.error("Error sending frame to backend:", err);
              }
            }
          }, "image/jpeg");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [processIncident]);

  return (
    <div className="flex h-screen">
      <Sidebar user={user} onLogout={logout} />
      <div className="flex-1 bg-black flex items-center justify-center relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {probability !== null && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded shadow-md text-sm">
            🚨 AI Prediction: <strong>{probability}%</strong>
          </div>
        )}
      </div>
    </div>
  );
}
