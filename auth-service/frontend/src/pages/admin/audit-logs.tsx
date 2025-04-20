import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <p className="text-muted-foreground">Review system audit logs and events.</p>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <p>Placeholder for audit logs display</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 