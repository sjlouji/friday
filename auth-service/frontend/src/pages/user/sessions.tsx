import { DashboardLayout } from '@friday/components';
import { useAuth } from '@/context/AuthContext';
import { routeCategories } from '@/routes';

export default function SessionsPage() {
  return (
    <DashboardLayout useAuth={useAuth} routeCategories={routeCategories}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Session Management</h2>
        <p className="text-muted-foreground">View and manage your active sessions.</p>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <p>Placeholder for session management interface</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 