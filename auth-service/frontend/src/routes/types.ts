export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title?: string;
}

export type RouteCategory = {
  name: string;
  description: string;
  icon?: string;
  routes: RouteConfig[];
}; 