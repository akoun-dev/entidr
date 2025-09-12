import { RouteDefinition } from '../../types/addon';

export class RouterService {
  private routes: RouteDefinition[] = [];

  public registerRoutes(newRoutes: RouteDefinition[]): void {
    // Vérification des doublons
    newRoutes.forEach(newRoute => {
      if (this.routes.some(r => r.path === newRoute.path)) {
        throw new Error(`Route ${newRoute.path} already registered`);
      }
    });
    this.routes = [...this.routes, ...newRoutes];
  }

  public getRoutes(): RouteDefinition[] {
    return this.routes;
  }

  public findRoute(path: string): RouteDefinition | undefined {
    return this.routes.find(r => r.path === path);
  }
}
