import { useState } from "react";
import { Button, Separator } from "@friday/components";
import { 
  Globe, 
  Monitor, 
  Smartphone, 
  Laptop, 
  Clock, 
  Trash2, 
  MapPin,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrentSession: boolean;
  deviceType: "mobile" | "desktop" | "tablet";
}

export default function SessionsTab() {
  // Mock sessions data
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "sess-1",
      device: "MacBook Pro",
      browser: "Chrome 110",
      location: "San Francisco, CA",
      ip: "192.168.1.1",
      lastActive: "Current session",
      isCurrentSession: true,
      deviceType: "desktop"
    },
    {
      id: "sess-2",
      device: "iPhone 14",
      browser: "Safari 16",
      location: "San Francisco, CA",
      ip: "192.168.1.2",
      lastActive: "2 hours ago",
      isCurrentSession: false,
      deviceType: "mobile"
    },
    {
      id: "sess-3",
      device: "Windows PC",
      browser: "Firefox 109",
      location: "New York, NY",
      ip: "203.0.113.1",
      lastActive: "Yesterday at 3:42 PM",
      isCurrentSession: false,
      deviceType: "desktop"
    },
    {
      id: "sess-4",
      device: "iPad Pro",
      browser: "Safari 16",
      location: "Chicago, IL",
      ip: "198.51.100.1",
      lastActive: "3 days ago",
      isCurrentSession: false,
      deviceType: "tablet"
    }
  ]);

  const handleTerminateSession = (sessionId: string) => {
    // In a real app, make an API call to terminate the session
    setSessions(sessions.filter(session => session.id !== sessionId));
  };

  const handleTerminateAllOtherSessions = () => {
    // In a real app, make an API call to terminate all other sessions
    setSessions(sessions.filter(session => session.isCurrentSession));
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4 text-gray-500" />;
      case "tablet":
        return <Laptop className="h-4 w-4 text-gray-500" />;
      case "desktop":
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700">Active Sessions</h3>
        <p className="text-sm text-gray-500 mt-1">
          Monitor and manage devices currently signed in to your account. For security, 
          sign out from any devices you don't recognize or aren't using anymore.
        </p>
      </div>

      <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm">Active Sessions ({sessions.length})</span>
          {sessions.length > 1 && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-8"
              onClick={handleTerminateAllOtherSessions}
            >
              Sign Out From All Other Devices
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`border rounded-lg overflow-hidden ${
              session.isCurrentSession ? 'bg-green-50 border-green-200' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`${session.isCurrentSession ? 'bg-green-100' : 'bg-gray-100'} rounded-md p-2`}>
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-sm">{session.device}</h3>
                      {session.isCurrentSession && (
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{session.browser}</p>
                  </div>
                </div>
                {!session.isCurrentSession && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs h-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Sign Out
                  </Button>
                )}
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span>{session.lastActive}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-mono">{session.ip}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <HelpCircle className="h-4 w-4 text-gray-500 mr-2" />
            About Device Sessions
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Sessions are created automatically when you sign in from a new device or browser.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Each session maintains your login state on that particular device.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Signing out from a device immediately terminates that session and requires you to sign in again to access your account.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>For security, sessions automatically expire after 30 days of inactivity.</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Security Tip</h4>
              <p className="text-sm text-blue-700">
                If you notice any sessions from devices or locations you don't recognize, 
                sign out of those sessions immediately and change your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 