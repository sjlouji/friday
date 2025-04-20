import { RouteConfig } from './types';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import ForgotPasswordPage from '@/pages/forgot-password';

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
  }
];

export default authRoutes; 