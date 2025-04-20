import { RouteConfig } from './types';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import ForgotPasswordPage from '@/pages/forgot-password';
import ProfilePage from '@/pages/profile';

const authRoutes: RouteConfig[] = [
  {
    path: '/',
    component: LoginPage,
    title: 'Login - Friday',
  },
  {
    path: '/login',
    component: LoginPage,
    title: 'Login - Friday',
  },
  {
    path: '/register',
    component: RegisterPage,
    title: 'Register - Friday',
  },
  {
    path: '/forgot-password',
    component: ForgotPasswordPage,
    title: 'Forgot Password - Friday',
  },
  {
    path: '/profile',
    component: ProfilePage,
    title: 'Profile - Friday',
    auth: true, // Requires authentication
  }
];

export default authRoutes; 