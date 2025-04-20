import HomePage from '@/pages/home';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import DashboardPage from '@/pages/dashboard';
import NotFoundPage from '@/pages/not-found';

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  auth?: boolean;
  admin?: boolean;
  title?: string;
  children?: RouteConfig[];
}

// Define route categories
export type RouteCategory = {
  name: string;
  description: string;
  icon?: string;
  routes: RouteConfig[];
};

// Public routes (no authentication required)
const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    exact: true,
    title: 'Friday - Your Personal AI Assistant',
  },
  {
    path: '/login',
    component: LoginPage,
    title: 'Login - Friday',
  },
  {
    path: '/register',
    component: RegisterPage,
    title: 'Create Account - Friday',
  },
  {
    path: '/consent',
    component: RegisterPage,
    title: 'Authorization Consent - Friday',
  },
];

// Dashboard routes (require authentication)
const dashboardRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: DashboardPage,
    auth: true,
    title: 'Dashboard - Friday',
  },
];

// Admin routes (require authentication and admin privileges)
const adminRoutes: RouteConfig[] = [
  {
    path: '/admin/sp-config',
    component: RegisterPage,
    auth: true,
    admin: true,
    title: 'Service Provider Configuration - Friday',
  },
  {
    path: '/admin/users',
    component: RegisterPage,
    auth: true,
    admin: true,
    title: 'User Management - Friday',
  },
  {
    path: '/admin/saml-metadata',
    component: RegisterPage,
    auth: true,
    admin: true,
    title: 'SAML Metadata - Friday',
  },
  {
    path: '/admin/audit-logs',
    component: RegisterPage,
    auth: true,
    admin: true,
    title: 'Audit Logs - Friday',
  },
];

// Tools routes (require authentication)
const toolsRoutes: RouteConfig[] = [
  {
    path: '/tools/saml-tester',
    component: RegisterPage,
    auth: true,
    title: 'SAML Tester - Friday',
  },
];

// User settings routes (require authentication)
const userRoutes: RouteConfig[] = [
  {
    path: '/user/sessions',
    component: RegisterPage,
    auth: true,
    title: 'Session Management - Friday',
  },
];

// Error routes
const errorRoutes: RouteConfig[] = [
  {
    path: '*',
    component: NotFoundPage,
    title: 'Page Not Found - Friday',
  },
];

// Group routes by category for sidebar navigation
export const routeCategories: RouteCategory[] = [
  {
    name: 'Dashboard',
    description: 'Main dashboard and overview',
    icon: 'dashboard',
    routes: dashboardRoutes,
  },
  {
    name: 'Administration',
    description: 'System administration and configuration',
    icon: 'settings',
    routes: adminRoutes,
  },
  {
    name: 'Tools',
    description: 'Utility tools and helpers',
    icon: 'tool',
    routes: toolsRoutes,
  },
  {
    name: 'User Settings',
    description: 'User profile and preferences',
    icon: 'user',
    routes: userRoutes,
  },
];

// Combine all routes for the router
const routes: RouteConfig[] = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...adminRoutes,
  ...toolsRoutes,
  ...userRoutes,
  ...errorRoutes,
];

export default routes; 