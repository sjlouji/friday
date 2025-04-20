import authRoutes from './authRoutes';
import NotFoundPage from '@/pages/not-found';
import { RouteConfig, RouteCategory } from './types';
export * from './types';

// Create a not found route
const notFoundRoute: RouteConfig[] = [
  {
    path: '*',
    component: NotFoundPage,
    title: 'Page Not Found',
  }
];

// Define route categories for dashboard navigation
export const routeCategories: RouteCategory[] = [
  {
    name: 'Account',
    description: 'Manage your account settings',
    routes: [
      {
        path: '/user/sessions',
        component: () => null,
        title: 'Sessions - Friday'
      }
    ]
  },
  {
    name: 'Admin',
    description: 'Administrative tools',
    routes: [
      {
        path: '/admin/user-management',
        component: () => null,
        title: 'User Management - Friday',
        admin: true
      },
      {
        path: '/admin/audit-logs',
        component: () => null,
        title: 'Audit Logs - Friday',
        admin: true
      },
      {
        path: '/admin/saml-metadata',
        component: () => null,
        title: 'SAML Metadata - Friday',
        admin: true
      },
      {
        path: '/admin/sp-config',
        component: () => null,
        title: 'SP Config - Friday',
        admin: true
      }
    ]
  },
  {
    name: 'Tools',
    description: 'Useful tools',
    routes: [
      {
        path: '/tools/saml-tester',
        component: () => null,
        title: 'SAML Tester - Friday'
      }
    ]
  }
];

// Combine all routes for the router
const routes = [
  ...authRoutes,
  ...notFoundRoute
];

export default routes; 