import { createRouter, createWebHashHistory, createWebHistory, createMemoryHistory, Router } from 'vue-router';
import type { RouteRecord, RouteGuard } from './types';
import type { ModuleSandbox } from '../ModuleSandbox';
import type { AuthModule } from '../auth/types';
import { generateRouteDocs } from './documentation.js';

type RouterMode = 'hash' | 'history' | 'memory';

export class RouterService {
  private router: Router;
  private sandbox: ModuleSandbox;
  private auth: AuthModule;

  private docs: string;
  
  constructor(
    routes: RouteRecord[],
    sandbox: ModuleSandbox,
    auth: AuthModule,
    mode: RouterMode = 'history'
  ) {
    this.sandbox = sandbox;
    this.auth = auth;
    
    const history = {
      history: createWebHistory(),
      hash: createWebHashHistory(),
      memory: createMemoryHistory()
    }[mode];

    this.router = createRouter({
      history,
      routes,
      scrollBehavior(to) {
        if (to.hash) {
          return { el: to.hash, behavior: 'smooth' };
        }
        return { top: 0 };
      }
    });

    this.docs = generateRouteDocs(routes);
    this.setupGuards();
    this.setupTransitions();
  }

  private setupGuards(): void {
    this.router.beforeEach((to, from, next) => {
      // Check authentication
      if (to.meta?.requiresAuth && !this.auth.getContext()) {
        return next('/login');
      }

      // Check permissions
      if (to.meta?.permissions) {
        const hasAccess = to.meta.permissions.some(perm => 
          this.auth.hasPermission(perm)
        );
        if (!hasAccess) return next('/forbidden');
      }

      // Check component exists
      if (!to.matched.length || !to.matched[0].components) {
        return next('/not-found');
      }
      next();
    });
  }

  public getRouter(): Router {
    return this.router;
  }

  public getRouteDocs(): string {
    return this.docs;
  }

  private setupTransitions(): void {
    this.router.afterEach((to, from) => {
      const toDepth = to.path.split('/').length;
      const fromDepth = from.path.split('/').length;
      to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left';
    });
  }

  public addGlobalGuard(guard: RouteGuard): void {
    this.router.beforeEach(guard);
  }
}