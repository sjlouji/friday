import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import routes, { RouteConfig } from './index';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  component: React.ComponentType;
  requiresAdmin?: boolean;
}

const ProtectedRoute = ({ component: Component, requiresAdmin = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiresAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Component />;
};

const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
};

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
