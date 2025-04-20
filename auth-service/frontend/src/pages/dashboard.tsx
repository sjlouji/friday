import { Button } from '@friday/components'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">Friday</span>
          </div>
          <Button onClick={() => navigate('/')} variant="ghost">
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="container flex-1 py-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-4">
          Welcome to your Friday Dashboard. This page is under construction.
        </p>
      </main>
    </div>
  )
} 