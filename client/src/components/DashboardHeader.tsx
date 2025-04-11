import { useQuery } from "@tanstack/react-query";

interface DashboardHeaderProps {
  activeIncidentsCount: number;
}

export default function DashboardHeader({ activeIncidentsCount }: DashboardHeaderProps) {
  return (
    <div className="p-4 md:p-6 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Live Dashboard</h2>
        <div className="mt-3 md:mt-0 flex flex-col md:flex-row md:space-x-4">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Camera Feed: Online</span>
          </div>
          <div className="flex items-center mt-2 md:mt-0">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Sensor Network: Online</span>
          </div>
          <div className="flex items-center mt-2 md:mt-0">
            <div className={`w-2.5 h-2.5 ${activeIncidentsCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'} rounded-full mr-2`}></div>
            <span className={`text-sm font-semibold ${activeIncidentsCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
              Active Incidents: {activeIncidentsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
