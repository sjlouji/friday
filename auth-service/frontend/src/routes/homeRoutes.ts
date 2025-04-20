import { RouteConfig } from './types';
import HomePage from '@/pages/home';
import NotFoundPage from '@/pages/not-found';

const homeRoutes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    title: 'Friday - Your Personal AI Assistant',
  },
  {
    path: '*',
    component: NotFoundPage,
    title: 'Page Not Found',
  }
];

export default homeRoutes; 