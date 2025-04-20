import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SpConfigPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Service Provider Configuration</h2>
        <p className="text-muted-foreground">Configure service provider settings for SAML integration.</p>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <p>Placeholder for SP configuration form</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 