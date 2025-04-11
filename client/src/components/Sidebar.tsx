import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BarChart2,
  Settings,
  LogOut,
  Video
} from "lucide-react";

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <h1 className="text-white font-bold text-xl">Emergency Response</h1>
      </div>
      <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-2">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
            <span className="text-white text-sm font-medium">System Online</span>
          </div>
        </div>
        <nav className="mt-8 flex-1 space-y-1">
          <Link href="/">
            <a
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                isActive("/") 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Home className="w-6 h-6 mr-3 text-gray-300" />
              Dashboard
            </a>
          </Link>
          <Link href="/live-feed">
            <a
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                isActive("/live-feed") 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Video className="w-6 h-6 mr-3 text-gray-300" />
              Live Feed
            </a>
          </Link>
          <Link href="/incidents">
            <a
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                isActive("/incidents") 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <BarChart2 className="w-6 h-6 mr-3 text-gray-300" />
              Incident History
            </a>
          </Link>
          <Link href="/settings">
            <a
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                isActive("/settings") 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Settings className="w-6 h-6 mr-3 text-gray-300" />
              Settings
            </a>
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white group"
          >
            <LogOut className="w-6 h-6 mr-3 text-gray-300" />
            Logout
          </button>
        </nav>
      </div>
      {user && (
        <div className="p-4 bg-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs font-medium text-gray-300">Emergency Response Team</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
