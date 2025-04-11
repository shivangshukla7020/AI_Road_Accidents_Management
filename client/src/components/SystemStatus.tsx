import { useQuery } from "@tanstack/react-query";
import { SystemStatus } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function SystemStatusCard() {
  const { data: statuses, isLoading } = useQuery<SystemStatus[]>({
    queryKey: ['/api/system-status'],
  });

  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return "bg-green-500";
    if (percentage > 70) return "bg-blue-500";
    if (percentage > 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatLastUpdate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader className="p-4 bg-gray-800 text-white">
        <CardTitle className="text-lg font-medium">System Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton loading state
            <>
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2.5 w-full" />
                </div>
              ))}
              <div className="mt-4 pt-3 border-t">
                <Skeleton className="h-4 w-52" />
              </div>
            </>
          ) : statuses && statuses.length > 0 ? (
            <>
              {statuses.map((status) => (
                <div key={status.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{status.name}</span>
                    <span className="font-medium">
                      {status.value !== null && status.name.includes("Online") 
                        ? `${status.value}/` + (status.name === "Cameras Online" ? "8" : "25")
                        : status.name === "Network Latency" 
                          ? `${status.value}ms` 
                          : `${status.percentage}%`
                      }
                    </span>
                  </div>
                  <Progress 
                    value={status.percentage} 
                    className="h-2.5 bg-gray-200" 
                    // indicatorClassName={getProgressColor(status.percentage)}
                  />
                </div>
              ))}
              <div className="mt-4 pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Last system check: <span className="font-medium">
                    {statuses[0] ? formatLastUpdate(statuses[0].lastUpdated) : "Unknown"}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No system status data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
