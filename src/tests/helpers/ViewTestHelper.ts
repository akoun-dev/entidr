/**
 * Helper pour les Tests E2E du Système de Vues Entidr
 *
 * Cette classe fournit des méthodes utilitaires pour les tests end-to-end,
 * incluant la gestion de l'authentification, la navigation et les utilitaires de test.
 */

import { Page, BrowserContext } from '@playwright/test';

export class ViewTestHelper {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Connecte un utilisateur avec les identifiants par défaut
   */
  async login(page: Page, username: string = 'testuser', password: string = 'password123'): Promise<void> {
    await page.goto(`${this.baseUrl}/login`);

    // Remplir le formulaire de connexion
    await page.fill('[data-testid="username-input"]', username);
    await page.fill('[data-testid="password-input"]', password);

    // Soumettre le formulaire
    await page.click('[data-testid="login-btn"]');

    // Attendre la redirection vers le dashboard
    await page.waitForURL(`${this.baseUrl}/dashboard`);
    await page.waitForSelector('[data-testid="dashboard-container"]');
  }

  /**
   * Connecte un utilisateur avec le rôle manager
   */
  async loginAsManager(page: Page): Promise<void> {
    await this.login(page, 'manager', 'manager123');
  }

  /**
   * Connecte un utilisateur avec le rôle admin
   */
  async loginAsAdmin(page: Page): Promise<void> {
    await this.login(page, 'admin', 'admin123');
  }

  /**
   * Connecte un utilisateur normal
   */
  async loginAsUser(page: Page): Promise<void> {
    await this.login(page, 'user', 'user123');
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  async logout(page: Page): Promise<void> {
    // Cliquer sur le menu utilisateur
    await page.click('[data-testid="user-menu-btn"]');

    // Cliquer sur le bouton de déconnexion
    await page.click('[data-testid="logout-btn"]');

    // Attendre la redirection vers la page de login
    await page.waitForURL(`${this.baseUrl}/login`);
  }

  /**
   * Crée des données de test pour les utilisateurs
   */
  async createTestUsers(page: Page, count: number = 5): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await page.goto(`${this.baseUrl}/views/user-list`);
      await page.waitForSelector('[data-testid="list-view"]');

      await page.click('[data-testid="add-user-btn"]');

      await page.fill('[data-testid="username-input"]', `testuser${i}`);
      await page.fill('[data-testid="email-input"]', `test${i}@example.com`);
      await page.fill('[data-testid="firstName-input"]', `Test`);
      await page.fill('[data-testid="lastName-input"]', `User ${i}`);
      await page.selectOption('[data-testid="status-select"]', 'active');
      await page.selectOption('[data-testid="role-select"]', 'user');

      await page.click('[data-testid="save-btn"]');
      await page.waitForSelector('[data-testid="list-view"]');
    }
  }

  /**
   * Crée des données de test pour les tâches
   */
  async createTestTasks(page: Page, count: number = 10): Promise<void> {
    const statuses = ['todo', 'inprogress', 'done'];
    const priorities = ['low', 'medium', 'high'];
    const assignees = ['user1', 'user2', 'user3'];

    for (let i = 1; i <= count; i++) {
      await page.goto(`${this.baseUrl}/views/task-list`);
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="kanban-view-option"]');
      await page.waitForSelector('[data-testid="kanban-view"]');

      await page.click('[data-testid="add-task-btn"]');

      await page.fill('[data-testid="quick-task-title"]', `Tâche de test ${i}`);
      await page.fill('[data-testid="quick-task-description"]', `Description de la tâche ${i}`);
      await page.selectOption('[data-testid="quick-task-priority"]', priorities[i % priorities.length]);

      await page.click('[data-testid="create-quick-task-btn"]');
      await page.waitForTimeout(500); // Attendre la création
    }
  }

  /**
   * Crée des données de test pour les événements
   */
  async createTestEvents(page: Page, count: number = 5): Promise<void> {
    const locations = ['Salle A', 'Salle B', 'Salle C', 'Visio', 'Extérieur'];

    for (let i = 1; i <= count; i++) {
      await page.goto(`${this.baseUrl}/views/event-list`);
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="calendar-view-option"]');
      await page.waitForSelector('[data-testid="calendar-view"]');

      await page.click('[data-testid="add-event-btn"]');

      await page.fill('[data-testid="event-title"]', `Événement de test ${i}`);
      await page.fill('[data-testid="event-description"]', `Description de l'événement ${i}`);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + i);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      await page.fill('[data-testid="event-start-date"]', startDate.toISOString().split('T')[0]);
      await page.fill('[data-testid="event-start-time"]', '10:00');
      await page.fill('[data-testid="event-end-date"]', endDate.toISOString().split('T')[0]);
      await page.fill('[data-testid="event-end-time"]', '11:00');
      await page.selectOption('[data-testid="event-location"]', locations[i % locations.length]);

      await page.click('[data-testid="save-event-btn"]');
      await page.waitForTimeout(500); // Attendre la création
    }
  }

  /**
   * Nettoie les données de test
   */
  async cleanupTestData(page: Page): Promise<void> {
    // Supprimer les utilisateurs de test
    await page.goto(`${this.baseUrl}/views/user-list`);
    await page.waitForSelector('[data-testid="list-view"]');

    const testUsers = await page.locator('[data-testid="table-row"]').filter({
      hasText: 'testuser'
    }).count();

    for (let i = 0; i < testUsers; i++) {
      await page.click('[data-testid="delete-btn"]:first-child');
      await page.click('[data-testid="confirm-delete-btn"]');
      await page.waitForTimeout(300);
    }

    // Supprimer les tâches de test
    await page.goto(`${this.baseUrl}/views/task-list`);
    await page.click('[data-testid="view-type-selector"]');
    await page.click('[data-testid="kanban-view-option]');
    await page.waitForSelector('[data-testid="kanban-view"]');

    const testTasks = await page.locator('[data-testid="kanban-card"]').filter({
      hasText: 'Tâche de test'
    }).count();

    for (let i = 0; i < testTasks; i++) {
      const taskCard = page.locator('[data-testid="kanban-card"]').filter({
        hasText: 'Tâche de test'
      }).first();

      await taskCard.click();
      await page.click('[data-testid="delete-task-btn"]');
      await page.click('[data-testid="confirm-delete-btn"]');
      await page.waitForTimeout(300);
    }

    // Supprimer les événements de test
    await page.goto(`${this.baseUrl}/views/event-list`);
    await page.click('[data-testid="view-type-selector"]');
    await page.click('[data-testid="calendar-view-option"]');
    await page.waitForSelector('[data-testid="calendar-view"]');

    const testEvents = await page.locator('[data-testid="calendar-event"]').filter({
      hasText: 'Événement de test'
    }).count();

    for (let i = 0; i < testEvents; i++) {
      const eventElement = page.locator('[data-testid="calendar-event"]').filter({
        hasText: 'Événement de test'
      }).first();

      await eventElement.click();
      await page.click('[data-testid="delete-event-btn"]');
      await page.click('[data-testid="confirm-delete-btn"]');
      await page.waitForTimeout(300);
    }
  }

  /**
   * Attend qu'un élément soit visible et interactif
   */
  async waitForElementToBeReady(page: Page, selector: string, timeout: number = 5000): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    await page.waitForSelector(selector, { state: 'enabled', timeout });
  }

  /**
   * Vérifie qu'un toast de succès est affiché
   */
  async expectSuccessToast(page: Page, message: string): Promise<void> {
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-message"]')).toContainText(message);
  }

  /**
   * Vérifie qu'un toast d'erreur est affiché
   */
  async expectErrorToast(page: Page, message: string): Promise<void> {
    await expect(page.locator('[data-testid="toast-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-message"]')).toContainText(message);
  }

  /**
   * Prend une capture d'écran pour le debugging
   */
  async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ path: `./test-results/screenshots/${name}-${Date.now()}.png` });
  }

  /**
   * Obtient le texte d'un élément de manière sécurisée
   */
  async getText(page: Page, selector: string): Promise<string> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.textContent() || '';
  }

  /**
   * Vérifie qu'une URL contient un chemin spécifique
   */
  async expectUrlContains(page: Page, path: string): Promise<void> {
    await expect(page.url()).toContain(path);
  }

  /**
   * Simule une latence réseau
   */
  async simulateNetworkLatency(page: Page, latency: number): Promise<void> {
    await page.context().setOffline(true);
    await page.waitForTimeout(latency);
    await page.context().setOffline(false);
  }

  /**
   * Configure le contexte du navigateur pour les tests
   */
  async setupBrowserContext(context: BrowserContext): Promise<void> {
    // Autoriser les notifications pour les tests
    await context.grantPermissions(['notifications']);

    // Définir le timezone pour les tests cohérents
    await context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 });
    await context.setLocale('fr-FR');

    // Désactiver les animations pour des tests plus rapides
    await context.addInitScript(() => {
      (window as any).__disableAnimations = true;
    });
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   */
  async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Vérifie les métriques de performance
   */
  async checkPerformanceMetrics(page: Page, metrics: {
    maxLoadTime?: number;
    maxMemory?: number;
    maxCpuTime?: number;
  }): Promise<void> {
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        memory: memory ? memory.usedJSHeapSize : 0,
        cpuTime: navigation.domComplete - navigation.domLoading
      };
    });

    if (metrics.maxLoadTime) {
      expect(performanceMetrics.loadTime).toBeLessThan(metrics.maxLoadTime);
    }

    if (metrics.maxMemory) {
      expect(performanceMetrics.memory).toBeLessThan(metrics.maxMemory);
    }

    if (metrics.maxCpuTime) {
      expect(performanceMetrics.cpuTime).toBeLessThan(metrics.maxCpuTime);
    }
  }

  /**
   * Génère un rapport de test
   */
  async generateTestReport(page: Page, testName: string): Promise<void> {
    const report = await page.evaluate(() => {
      return {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        performance: {
          loadTime: performance.timing.loadEventEnd - performance.timing.loadEventStart,
          domReady: performance.timing.domContentLoadedEventEnd - performance.timing.domContentLoadedEventStart
        }
      };
    });

    // Sauvegarder le rapport
    await page.evaluate((report) => {
      const reports = JSON.parse(localStorage.getItem('testReports') || '[]');
      reports.push(report);
      localStorage.setItem('testReports', JSON.stringify(reports));
    }, report);
  }
}
