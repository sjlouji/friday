import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ConsentPage() {
  return (
    <div className="container mx-auto max-w-lg py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Authorization Consent</h1>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <p className="mb-4">
          The application is requesting permission to access your account information.
        </p>
        
        <h2 className="text-lg font-semibold mb-2">Required permissions:</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>View your profile information</li>
          <li>Access your dashboard data</li>
        </ul>
        
        <div className="flex gap-4">
          <Button className="w-full">Allow Access</Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Deny</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 