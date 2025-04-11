import { useQuery } from "@tanstack/react-query";
import { Incident } from "../../../shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIncidentModal } from "@/context/IncidentalModelContext";
import Sidebar from "@/components/Sidebar"; // 👈 Import Sidebar
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/hooks";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function IncidentHistory() {
  const { openModal } = useIncidentModal();
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: incidents, isLoading: isLoadingIncidents } = useQuery<Incident[]>({
    queryKey: ['/api/incidents/active'],
  });

  const handleViewIncidentDetails = (incident: Incident) => {
    openModal(incident);
  };

  const prepareChartData = (incidents: Incident[]) => {
    const dateLabels: string[] = [];
    const incidentCounts: number[] = [];

    incidents.forEach((incident) => {
      const date = new Date(incident.detectedAt).toLocaleDateString();
      const index = dateLabels.indexOf(date);

      if (index === -1) {
        dateLabels.push(date);
        incidentCounts.push(1);
      } else {
        incidentCounts[index] += 1;
      }
    });

    return {
      labels: dateLabels,
      datasets: [
        {
          label: "Incidents per Day",
          data: incidentCounts,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = incidents ? prepareChartData(incidents) : { labels: [], datasets: [] };
  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="flex h-screen">
     <Sidebar user={user} onLogout={handleLogout} />


      <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-6">Incident History</h2>

        {/* Incident History Table */}
        <div className="overflow-hidden rounded-lg shadow-md bg-white">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Active Incidents</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Incident ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Severity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingIncidents ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-center text-sm text-gray-500">Loading...</td>
                    </tr>
                  ) : incidents && incidents.length > 0 ? (
                    incidents.map((incident) => (
                      <tr key={incident.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-600">{incident.incidentId}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{incident.title}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full ${incident.severity === 'high' ? 'bg-red-100 text-red-600' : incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{incident.status}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{new Date(incident.detectedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          <Button size="sm" variant="outline" onClick={() => handleViewIncidentDetails(incident)}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-center text-sm text-gray-500">No active incidents found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Incident Graph */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Incidents Over Time</h3>
          {isLoadingIncidents ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Number of Incidents Per Day',
                    font: { size: 16 },
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `Incidents: ${tooltipItem.raw}`,
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
