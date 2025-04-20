export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title?: string;
  admin?: boolean;
  auth?: boolean;
}

export type RouteCategory = {
  name: string;
  description: string;
  icon?: string;
  routes: RouteConfig[];
}; 