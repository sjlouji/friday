import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import routes, { RouteConfig } from './index';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  component: React.ComponentType;
  requiresAdmin?: boolean;
}

// Protected route component that uses AuthContext
const ProtectedRoute = ({ component: Component, requiresAdmin = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login if not authenticated, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If route requires admin privilege, check if user is admin
  if (requiresAdmin && !user?.isAdmin) {
    // Redirect to dashboard if user is not an admin
    return <Navigate to="/dashboard" replace />;
  }

  return <Component />;
};

// Handle updating document title based on route
const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
};

// Route renderer
const RouteRenderer = ({ route }: { route: RouteConfig }) => {
  useDocumentTitle(route.title);
  
  if (route.auth) {
    return (
      <ProtectedRoute 
        component={route.component} 
        requiresAdmin={route.admin} 
      />
    );
  }
  
  return <route.component />;
};

// Main router component
const AppRouter = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteRenderer route={route} />}
        />
      ))}
    </Routes>
  );
};

export default AppRouter;
