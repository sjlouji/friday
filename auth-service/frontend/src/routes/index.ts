import authRoutes from './authRoutes';
import NotFoundPage from '@/pages/not-found';
import { RouteConfig } from './types';
export * from './types';

// Create a not found route
const notFoundRoute: RouteConfig[] = [
  {
    path: '*',
    component: NotFoundPage,
    title: 'Page Not Found',
  }
];

// Combine all routes for the router
const routes = [
  ...authRoutes,
  ...notFoundRoute
];

export default routes; 