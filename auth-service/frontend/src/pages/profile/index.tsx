import { useState } from "react";
import { Separator } from "@friday/components";
import ProfileTab from "./tabs/ProfileTab";
import AccountTab from "./tabs/AccountTab";
import AuthenticationTab from "./tabs/AuthenticationTab";
import SessionsTab from "./tabs/SessionsTab";
import AuditLogsTab from "./tabs/AuditLogsTab";
import { 
  User, 
  CreditCard, 
  Lock, 
  Monitor, 
  ClipboardList
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Define tab data for easier management
  const tabs = [
    { id: "profile", label: "Profile", icon: User, component: ProfileTab },
    { id: "account", label: "Account", icon: CreditCard, component: AccountTab },
    { id: "authentication", label: "Authentication", icon: Lock, component: AuthenticationTab },
    { id: "sessions", label: "Sessions", icon: Monitor, component: SessionsTab },
    { id: "audit", label: "Audit", icon: ClipboardList, component: AuditLogsTab },
  ];

  // Get active tab component
  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component || tabs[0].component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile information and account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr] gap-8 px-2">
          {/* Sidebar */}
          <div className="border-r border-gray-200 pr-6">
            <nav className="sticky top-6">
              <ul className="space-y-1">
                {tabs.map(tab => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                        activeTab === tab.id
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <tab.icon className={`h-4 w-4 mr-3 ${activeTab === tab.id ? "text-gray-900" : "text-gray-500"}`} />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="pl-4">
            <div className="max-w-4xl">
              <ActiveTabComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 