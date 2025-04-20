import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SamlTesterPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">SAML Tester</h2>
        <p className="text-muted-foreground">Test SAML authentication flows.</p>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <p>Placeholder for SAML testing tool</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 