import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function UserManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-muted-foreground">Manage users, roles and permissions.</p>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <p>Placeholder for user management interface</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 