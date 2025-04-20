import { useState } from "react";
import { 
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator
} from "@friday/components";
import { 
  Search, 
  Calendar, 
  Download, 
  Info, 
  Settings, 
  Lock, 
  User, 
  LogIn, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ClipboardList
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: "success" | "failed" | "warning";
  details: string;
  category: "auth" | "user" | "settings" | "security";
}

export default function AuditLogsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeframe, setTimeframe] = useState("7days");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  
  // Mock audit logs data
  const auditLogs: AuditLog[] = [
    {
      id: "log-1",
      timestamp: "Apr 20, 2023 14:32:15",
      user: "admin@friday.com",
      action: "Login",
      resource: "Auth System",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "Successful login via password",
      category: "auth"
    },
    {
      id: "log-2",
      timestamp: "Apr 20, 2023 14:30:05",
      user: "admin@friday.com",
      action: "Failed Login",
      resource: "Auth System",
      ipAddress: "192.168.1.1",
      status: "failed",
      details: "Invalid password (attempt 1 of 5)",
      category: "auth"
    },
    {
      id: "log-3",
      timestamp: "Apr 19, 2023 16:45:22",
      user: "admin@friday.com",
      action: "Password Change",
      resource: "User Account",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "User changed their password",
      category: "security"
    },
    {
      id: "log-4",
      timestamp: "Apr 18, 2023 09:15:30",
      user: "admin@friday.com",
      action: "Profile Update",
      resource: "User Profile",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "Updated profile information (name, location)",
      category: "user"
    },
    {
      id: "log-5",
      timestamp: "Apr 17, 2023 11:22:09",
      user: "admin@friday.com",
      action: "2FA Setup",
      resource: "Security Settings",
      ipAddress: "192.168.1.1",
      status: "warning",
      details: "Two-factor authentication setup started but not completed",
      category: "security"
    },
    {
      id: "log-6",
      timestamp: "Apr 16, 2023 15:30:45",
      user: "admin@friday.com",
      action: "Email Change Request",
      resource: "User Account",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "Requested email change to new_admin@friday.com",
      category: "settings"
    },
    {
      id: "log-7",
      timestamp: "Apr 15, 2023 08:12:33",
      user: "admin@friday.com",
      action: "Account Settings Update",
      resource: "User Settings",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "Updated notification preferences",
      category: "settings"
    },
    {
      id: "log-8",
      timestamp: "Apr 14, 2023 19:40:12",
      user: "admin@friday.com",
      action: "Login",
      resource: "Auth System",
      ipAddress: "203.0.113.1",
      status: "warning",
      details: "Login from new location",
      category: "auth"
    },
    {
      id: "log-9",
      timestamp: "Apr 13, 2023 13:05:50",
      user: "admin@friday.com",
      action: "Passkey Added",
      resource: "Security Settings",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "Added new passkey 'MacBook Pro'",
      category: "security"
    },
    {
      id: "log-10",
      timestamp: "Apr 12, 2023 10:15:22",
      user: "admin@friday.com",
      action: "Password Reset Request",
      resource: "Auth System",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "Requested password reset link",
      category: "auth"
    },
    {
      id: "log-11",
      timestamp: "Apr 11, 2023 16:30:45",
      user: "admin@friday.com",
      action: "Account Lockout",
      resource: "Auth System",
      ipAddress: "198.51.100.1",
      status: "failed",
      details: "Account temporarily locked due to multiple failed login attempts",
      category: "security"
    },
    {
      id: "log-12",
      timestamp: "Apr 10, 2023 09:22:18",
      user: "admin@friday.com",
      action: "Session Terminated",
      resource: "Session Management",
      ipAddress: "192.168.1.1",
      status: "success",
      details: "User terminated session from another device",
      category: "security"
    }
  ];

  // Filter logs based on search, timeframe, and category
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = category === "all" || log.category === category;
    
    // For simplicity, we're not implementing actual date filtering
    // In a real app, you would filter by actual dates
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> Success
        </Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1 text-red-600" /> Failed
        </Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1 text-yellow-600" /> Warning
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700">Audit Log</h3>
        <p className="text-sm text-gray-500 mt-1">
          Track and review all actions and activities on your account. Audit logs provide a detailed 
          history of interactions with your account, helping you monitor security and compliance.
        </p>
      </div>

      <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-3 items-end">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search logs by action, user, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 h-9 text-sm"
            />
          </div>
          
          <div className="w-full md:w-auto flex space-x-4">
            <div className="flex-1 md:w-40">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-gray-400" />
                    <span>Category: {category === "all" ? "All" : category}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 md:w-40">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="h-9 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>Time: {timeframe}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">Last 24 Hours</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              className="h-9"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-700">Activity Log</h4>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            This is a chronological record of actions taken on your account, including logins, 
            setting changes, and security events.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">IP Address</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.user}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="px-2 py-1 rounded-md text-xs border border-gray-200 bg-gray-50">
                        {log.resource}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-600">{log.ipAddress}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    No logs match your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              Showing <span className="font-medium">{indexOfFirstLog + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastLog, filteredLogs.length)}
              </span>{" "}
              of <span className="font-medium">{filteredLogs.length}</span> logs
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {currentLogs.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <div className="p-4 border rounded-md bg-gray-50 border-gray-200">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Understanding Audit Logs</h3>
            <p className="text-sm text-gray-600 mb-2">
              Audit logs record user interactions with the system and are crucial for security monitoring
              and compliance. They help identify unusual activity and troubleshoot issues.
            </p>
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> Success
                </Badge>
                <span className="text-xs text-gray-600">Indicates a completed action with no issues</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700">
                  <AlertTriangle className="h-3 w-3 mr-1 text-yellow-600" /> Warning
                </Badge>
                <span className="text-xs text-gray-600">Indicates a completed action with potential issues</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-700">
                  <XCircle className="h-3 w-3 mr-1 text-red-600" /> Failed
                </Badge>
                <span className="text-xs text-gray-600">Indicates an action that failed to complete</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 