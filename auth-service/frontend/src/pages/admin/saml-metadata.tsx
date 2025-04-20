import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SamlMetadataPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">SAML Metadata</h2>
        <p className="text-muted-foreground">View and manage SAML metadata configuration.</p>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <p>Placeholder for SAML metadata information</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 