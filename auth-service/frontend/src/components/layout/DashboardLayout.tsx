import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { routeCategories } from '@/routes';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Filter categories based on user role
  const filteredCategories = routeCategories.filter(category => {
    // If any route in the category doesn't require admin, show it to all
    if (category.routes.some(route => !route.admin)) {
      return true;
    }
    
    // Only show admin categories to admin users
    return user?.isAdmin;
  });
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold">Friday</h1>
        </div>
        
        {/* Navigation */}
        <nav className="p-2">
          {filteredCategories.map(category => (
            <div key={category.name} className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                {category.name}
              </h2>
              <ul className="space-y-1">
                {category.routes.filter(route => !route.admin || user?.isAdmin).map(route => (
                  <li key={route.path}>
                    <Link
                      to={route.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-md ${
                        location.pathname === route.path
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {route.title?.split(' - ')[0]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        
        {/* User Section */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button variant="outline" size="sm" className="w-full" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">
            {routeCategories
              .flatMap(c => c.routes)
              .find(r => r.path === location.pathname)?.title?.split(' - ')[0] || 'Dashboard'}
          </h2>
          <div>
            {user?.isAdmin && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium mr-2">
                Admin
              </span>
            )}
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 