/**
 * Tests End-to-End pour le Système de Vues Entidr
 *
 * Ces tests couvrent les scénarios utilisateur réels, la navigation entre les vues,
 * les workflows complets et l'intégration avec le backend.
 */

import { test, expect } from '@playwright/test';
import { ViewTestHelper } from '../helpers/ViewTestHelper';

// Helper pour les tests E2E
const viewHelper = new ViewTestHelper();

test.describe('Système de Vues Entidr - Tests E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Se connecter avant chaque test
    await viewHelper.login(page);

    // Attendre que la page principale soit chargée
    await page.waitForSelector('[data-testid="main-container"]');
  });

  test.afterEach(async ({ page }) => {
    // Se déconnecter après chaque test
    await viewHelper.logout(page);
  });

  test.describe('Navigation entre les vues', () => {

    test('devrait naviguer de ListView à FormView et retour', async ({ page }) => {
      // Commencer sur la ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Cliquer sur le bouton "Ajouter" pour aller à FormView
      await page.click('[data-testid="add-user-btn"]');

      // Vérifier que nous sommes sur FormView
      await expect(page.locator('[data-testid="form-view"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Créer un utilisateur');

      // Retourner à ListView en annulant
      await page.click('[data-testid="cancel-btn"]');

      // Vérifier que nous sommes revenus à ListView
      await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
    });

    test('devrait naviguer de ListView à KanbanView', async ({ page }) => {
      // Commencer sur ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Changer le type de vue vers Kanban
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="kanban-view-option"]');

      // Vérifier que nous sommes sur KanbanView
      await expect(page.locator('[data-testid="kanban-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="kanban-column"]')).toHaveCount(3); // active, inactive, pending

      // Retourner à ListView
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="list-view-option"]');

      // Vérifier que nous sommes revenus à ListView
      await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
    });

    test('devrait naviguer entre ListView et CalendarView', async ({ page }) => {
      // Commencer sur ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Changer le type de vue vers Calendar
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="calendar-view-option"]');

      // Vérifier que nous sommes sur CalendarView
      await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();

      // Naviguer vers un événement spécifique
      await page.click('[data-testid="calendar-event"]:first-child');

      // Vérifier que la modale d'événement s'ouvre
      await expect(page.locator('[data-testid="event-modal"]')).toBeVisible();

      // Fermer la modale
      await page.click('[data-testid="close-modal-btn"]');

      // Retourner à ListView
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="list-view-option"]');

      // Vérifier que nous sommes revenus à ListView
      await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
    });

    test('devrait conserver l\'état lors de la navigation entre les vues', async ({ page }) => {
      // Commencer sur ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Appliquer un filtre
      await page.fill('[data-testid="search-input"]', 'admin');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Vérifier que le filtre est appliqué
      await expect(page.locator('[data-testid="table-row"]')).toHaveCount(1);

      // Changer vers KanbanView
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="kanban-view-option"]');

      // Vérifier que le filtre est conservé dans KanbanView
      await expect(page.locator('[data-testid="kanban-card"]')).toHaveCount(1);

      // Retourner à ListView
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="list-view-option"]');

      // Vérifier que le filtre est toujours appliqué
      await expect(page.locator('[data-testid="table-row"]')).toHaveCount(1);
    });
  });

  test.describe('Workflows complets', () => {

    test('devrait compléter le workflow CRUD complet', async ({ page }) => {
      // 1. Commencer sur ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Compter le nombre initial d'utilisateurs
      const initialCount = await page.locator('[data-testid="table-row"]').count();

      // 2. Créer un nouvel utilisateur
      await page.click('[data-testid="add-user-btn"]');

      // Remplir le formulaire
      await page.fill('[data-testid="username-input"]', 'testuser');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="firstName-input"]', 'Test');
      await page.fill('[data-testid="lastName-input"]', 'User');
      await page.selectOption('[data-testid="status-select"]', 'active');
      await page.selectOption('[data-testid="role-select"]', 'user');

      // Soumettre le formulaire
      await page.click('[data-testid="save-btn"]');

      // Attendre le retour à ListView
      await page.waitForSelector('[data-testid="list-view"]');

      // Vérifier que le nouvel utilisateur a été créé
      await expect(page.locator('[data-testid="table-row"]')).toHaveCount(initialCount + 1);
      await expect(page.locator('[data-testid="table-cell"]')).toContainText('testuser');

      // 3. Lire/Éditer l'utilisateur créé
      await page.click('[data-testid="edit-btn"]:first-child');

      // Vérifier que nous sommes sur FormView en mode édition
      await expect(page.locator('[data-testid="form-view"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Modifier l\'utilisateur');

      // Modifier l'email
      await page.fill('[data-testid="email-input"]', 'updated@example.com');

      // Sauvegarder les modifications
      await page.click('[data-testid="save-btn"]');

      // Attendre le retour à ListView
      await page.waitForSelector('[data-testid="list-view"]');

      // Vérifier que l'email a été mis à jour
      await expect(page.locator('[data-testid="table-cell"]')).toContainText('updated@example.com');

      // 4. Supprimer l'utilisateur
      await page.click('[data-testid="delete-btn"]:first-child');

      // Confirmer la suppression dans la modale
      await page.click('[data-testid="confirm-delete-btn"]');

      // Attendre que la suppression soit terminée
      await page.waitForSelector('[data-testid="list-view"]');

      // Vérifier que l'utilisateur a été supprimé
      await expect(page.locator('[data-testid="table-row"]')).toHaveCount(initialCount);
      await expect(page.locator('[data-testid="table-cell"]')).not.toContainText('testuser');
    });

    test('devrait compléter le workflow de gestion de tâches dans KanbanView', async ({ page }) => {
      // Aller à KanbanView
      await page.goto('/views/task-list');
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="kanban-view-option"]');
      await page.waitForSelector('[data-testid="kanban-view"]');

      // Compter les tâches initiales dans chaque colonne
      const todoCount = await page.locator('[data-testid="kanban-column-todo"] [data-testid="kanban-card"]').count();
      const inProgressCount = await page.locator('[data-testid="kanban-column-inprogress"] [data-testid="kanban-card"]').count();
      const doneCount = await page.locator('[data-testid="kanban-column-done"] [data-testid="kanban-card"]').count();

      // 1. Créer une nouvelle tâche
      await page.click('[data-testid="add-task-btn"]');

      // Remplir le formulaire rapide
      await page.fill('[data-testid="quick-task-title"]', 'Nouvelle tâche E2E');
      await page.fill('[data-testid="quick-task-description"]', 'Description de la tâche de test');
      await page.selectOption('[data-testid="quick-task-priority"]', 'medium');

      // Créer la tâche
      await page.click('[data-testid="create-quick-task-btn"]');

      // Vérifier que la tâche apparaît dans la colonne TODO
      await expect(page.locator('[data-testid="kanban-column-todo"] [data-testid="kanban-card"]')).toHaveCount(todoCount + 1);
      await expect(page.locator('[data-testid="kanban-column-todo"]')).toContainText('Nouvelle tâche E2E');

      // 2. Déplacer la tâche vers "In Progress"
      const taskCard = page.locator('[data-testid="kanban-card"]').filter({ hasText: 'Nouvelle tâche E2E' });
      const inProgressColumn = page.locator('[data-testid="kanban-column-inprogress"]');

      await taskCard.dragTo(inProgressColumn);

      // Vérifier que la tâche a été déplacée
      await expect(page.locator('[data-testid="kanban-column-todo"] [data-testid="kanban-card"]')).toHaveCount(todoCount);
      await expect(page.locator('[data-testid="kanban-column-inprogress"] [data-testid="kanban-card"]')).toHaveCount(inProgressCount + 1);

      // 3. Éditer la tâche
      await taskCard.click();

      // La modale de détails devrait s'ouvrir
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();

      // Modifier la description
      await page.fill('[data-testid="task-description"]', 'Description mise à jour par le test E2E');

      // Sauvegarder les modifications
      await page.click('[data-testid="save-task-btn"]');

      // Fermer la modale
      await page.click('[data-testid="close-modal-btn"]');

      // Vérifier que les modifications ont été sauvegardées
      await taskCard.click();
      await expect(page.locator('[data-testid="task-description"]')).toHaveValue('Description mise à jour par le test E2E');
      await page.click('[data-testid="close-modal-btn"]');

      // 4. Déplacer la tâche vers "Done"
      const doneColumn = page.locator('[data-testid="kanban-column-done"]');

      await taskCard.dragTo(doneColumn);

      // Vérifier que la tâche a été déplacée
      await expect(page.locator('[data-testid="kanban-column-inprogress"] [data-testid="kanban-card"]')).toHaveCount(inProgressCount);
      await expect(page.locator('[data-testid="kanban-column-done"] [data-testid="kanban-card"]')).toHaveCount(doneCount + 1);

      // 5. Supprimer la tâche
      await taskCard.click();
      await page.click('[data-testid="delete-task-btn"]');
      await page.click('[data-testid="confirm-delete-btn"]');

      // Vérifier que la tâche a été supprimée
      await expect(page.locator('[data-testid="kanban-column-done"] [data-testid="kanban-card"]')).toHaveCount(doneCount);
    });

    test('devrait compléter le workflow de gestion d\'événements dans CalendarView', async ({ page }) => {
      // Aller à CalendarView
      await page.goto('/views/event-list');
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="calendar-view-option"]');
      await page.waitForSelector('[data-testid="calendar-view"]');

      // 1. Créer un nouvel événement
      await page.click('[data-testid="add-event-btn"]');

      // Remplir le formulaire d'événement
      await page.fill('[data-testid="event-title"]', 'Réunion E2E');
      await page.fill('[data-testid="event-description"]', 'Réunion de test end-to-end');
      await page.fill('[data-testid="event-start-date"]', '2024-01-15');
      await page.fill('[data-testid="event-start-time"]', '10:00');
      await page.fill('[data-testid="event-end-date"]', '2024-01-15');
      await page.fill('[data-testid="event-end-time"]', '11:00');
      await page.selectOption('[data-testid="event-location"]', 'Salle de conférence A');

      // Créer l'événement
      await page.click('[data-testid="save-event-btn"]');

      // Vérifier que l'événement apparaît dans le calendrier
      await expect(page.locator('[data-testid="calendar-event"]')).toContainText('Réunion E2E');

      // 2. Éditer l'événement
      await page.click('[data-testid="calendar-event"]');

      // La modale de détails devrait s'ouvrir
      await expect(page.locator('[data-testid="event-modal"]')).toBeVisible();

      // Modifier le titre
      await page.fill('[data-testid="event-title"]', 'Réunion E2E Modifiée');

      // Sauvegarder les modifications
      await page.click('[data-testid="save-event-btn"]');

      // Fermer la modale
      await page.click('[data-testid="close-modal-btn"]');

      // Vérifier que les modifications ont été sauvegardées
      await expect(page.locator('[data-testid="calendar-event"]')).toContainText('Réunion E2E Modifiée');

      // 3. Supprimer l'événement
      await page.click('[data-testid="calendar-event"]');
      await page.click('[data-testid="delete-event-btn"]');
      await page.click('[data-testid="confirm-delete-btn"]');

      // Vérifier que l'événement a été supprimé
      await expect(page.locator('[data-testid="calendar-event"]')).not.toContainText('Réunion E2E Modifiée');
    });
  });

  test.describe('Intégration avec le backend', () => {

    test('devrait synchroniser les données avec le backend', async ({ page }) => {
      // Commencer sur ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Créer un utilisateur via l'interface
      await page.click('[data-testid="add-user-btn"]');
      await page.fill('[data-testid="username-input"]', 'syncuser');
      await page.fill('[data-testid="email-input"]', 'sync@example.com');
      await page.fill('[data-testid="firstName-input"]', 'Sync');
      await page.fill('[data-testid="lastName-input"]', 'User');
      await page.click('[data-testid="save-btn"]');

      // Attendre la synchronisation
      await page.waitForSelector('[data-testid="sync-indicator"]');
      await expect(page.locator('[data-testid="sync-indicator"]')).toBeHidden();

      // Vérifier que l'utilisateur a été créé
      await expect(page.locator('[data-testid="table-cell"]')).toContainText('syncuser');

      // Simuler une modification directe dans la base de données via API
      const apiResponse = await page.request.put('/api/users/syncuser', {
        data: {
          email: 'synced@example.com',
          status: 'inactive'
        }
      });

      expect(apiResponse.ok()).toBeTruthy();

      // Forcer un rafraîchissement depuis le backend
      await page.click('[data-testid="refresh-btn"]');
      await page.waitForSelector('[data-testid="sync-indicator"]');
      await expect(page.locator('[data-testid="sync-indicator"]')).toBeHidden();

      // Vérifier que les modifications ont été synchronisées
      await expect(page.locator('[data-testid="table-cell"]')).toContainText('synced@example.com');

      // Supprimer l'utilisateur via l'interface
      await page.click('[data-testid="delete-btn"]:first-child');
      await page.click('[data-testid="confirm-delete-btn"]');

      // Vérifier la suppression via API
      const getResponse = await page.request.get('/api/users/syncuser');
      expect(getResponse.status()).toBe(404);
    });

    test('devrait gérer les erreurs de backend gracieusement', async ({ page }) => {
      // Commencer sur ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Simuler une erreur de backend
      await page.route('/api/users', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Erreur de serveur interne' })
        });
      });

      // Tenter de charger les données
      await page.click('[data-testid="refresh-btn"]');

      // Vérifier que le message d'erreur s'affiche
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Erreur de serveur interne');

      // Vérifier que le bouton de retry est présent
      await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();

      // Restaurer le routeur normal
      await page.unroute('/api/users');

      // Cliquer sur retry
      await page.click('[data-testid="retry-btn"]');

      // Vérifier que les données se chargent correctement
      await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toBeHidden();
    });

    test('devrait gérer les conflits de concurrence', async ({ page }) => {
      // Commencer sur ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Sélectionner un utilisateur à modifier
      await page.click('[data-testid="edit-btn"]:first-child');

      // Récupérer l'ID de l'utilisateur
      const userId = await page.locator('[data-testid="user-id"]').first().textContent();

      // Ouvrir un deuxième onglet pour simuler un autre utilisateur
      const page2 = await page.context().newPage();
      await viewHelper.login(page2);
      await page2.goto('/views/user-list');
      await page2.waitForSelector('[data-testid="list-view"]');

      // Modifier l'utilisateur dans le deuxième onglet
      await page2.click('[data-testid="edit-btn"]:first-child');
      await page2.fill('[data-testid="email-input"]', 'conflict@example.com');
      await page2.click('[data-testid="save-btn"]');

      // Attendre la sauvegarde dans le deuxième onglet
      await page2.waitForSelector('[data-testid="sync-indicator"]');
      await expect(page2.locator('[data-testid="sync-indicator"]')).toBeHidden();

      // Modifier le même utilisateur dans le premier onglet
      await page.fill('[data-testid="email-input"]', 'another@example.com');
      await page.click('[data-testid="save-btn"]');

      // Vérifier que le message de conflit s'affiche
      await expect(page.locator('[data-testid="conflict-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="conflict-message"]')).toContainText('conflit de concurrence');

      // Choisir de garder les modifications du premier onglet
      await page.click('[data-testid="keep-my-changes-btn"]');

      // Vérifier que les modifications ont été appliquées
      await expect(page.locator('[data-testid="table-cell"]')).toContainText('another@example.com');

      // Fermer le deuxième onglet
      await page2.close();
    });
  });

  test.describe('Scénarios utilisateur réels', () => {

    test('devrait permettre à un manager de gérer son équipe', async ({ page }) => {
      // Se connecter en tant que manager
      await viewHelper.loginAsManager(page);

      // Aller à la vue de l'équipe
      await page.goto('/views/team-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Vérifier que le manager ne voit que son équipe
      const teamMembers = await page.locator('[data-testid="table-row"]').count();
      expect(teamMembers).toBeGreaterThan(0);
      expect(teamMembers).toBeLessThan(10); // Pas toute l'entreprise

      // Ajouter un nouveau membre à l'équipe
      await page.click('[data-testid="add-member-btn"]');
      await page.fill('[data-testid="member-search"]', 'john');
      await page.click('[data-testid="search-result"]:first-child');
      await page.click('[data-testid="add-to-team-btn"]');

      // Vérifier que le membre a été ajouté
      await expect(page.locator('[data-testid="table-row"]')).toHaveCount(teamMembers + 1);

      // Passer à KanbanView pour voir la charge de travail
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="kanban-view-option"]');
      await page.waitForSelector('[data-testid="kanban-view"]');

      // Vérifier que le manager peut voir les tâches de son équipe
      const todoTasks = await page.locator('[data-testid="kanban-column-todo"] [data-testid="kanban-card"]').count();
      expect(todoTasks).toBeGreaterThan(0);

      // Réaffecter une tâche
      const taskCard = page.locator('[data-testid="kanban-card"]').first();
      await taskCard.click();
      await page.selectOption('[data-testid="task-assignee"]', 'john');
      await page.click('[data-testid="save-task-btn"]');

      // Vérifier que la tâche a été réaffectée
      await expect(taskCard.locator('[data-testid="task-assignee"]')).toContainText('john');

      // Générer un rapport de l'équipe
      await page.click('[data-testid="generate-report-btn"]');
      await expect(page.locator('[data-testid="report-modal"]')).toBeVisible();

      // Vérifier le contenu du rapport
      await expect(page.locator('[data-testid="report-content"]')).toContainText('Charge de travail');
      await expect(page.locator('[data-testid="report-content"]')).toContainText('Productivité');

      // Fermer le rapport
      await page.click('[data-testid="close-report-btn"]');
    });

    test('devrait permettre à un admin de configurer les vues', async ({ page }) => {
      // Se connecter en tant qu'admin
      await viewHelper.loginAsAdmin(page);

      // Aller à la page de configuration des vues
      await page.goto('/admin/views');
      await page.waitForSelector('[data-testid="admin-views-container"]');

      // Créer une nouvelle vue
      await page.click('[data-testid="create-view-btn"]');

      // Configurer la vue
      await page.fill('[data-testid="view-name"]', 'Vue de Test E2E');
      await page.selectOption('[data-testid="view-type"]', 'LIST');
      await page.selectOption('[data-testid="view-model"]', 'User');

      // Ajouter des champs
      await page.click('[data-testid="add-field-btn"]');
      await page.fill('[data-testid="field-name"]', 'username');
      await page.fill('[data-testid="field-label"]', "Nom d'utilisateur");
      await page.selectOption('[data-testid="field-widget"]', 'INPUT');
      await page.click('[data-testid="save-field-btn"]');

      // Sauvegarder la vue
      await page.click('[data-testid="save-view-btn"]');

      // Vérifier que la vue a été créée
      await expect(page.locator('[data-testid="view-item"]')).toContainText('Vue de Test E2E');

      // Tester la vue créée
      await page.click('[data-testid="view-item"]');
      await page.click('[data-testid="preview-view-btn"]');

      // Vérifier que la prévisualisation s'ouvre
      await expect(page.locator('[data-testid="view-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="preview-table"]')).toBeVisible();

      // Fermer la prévisualisation
      await page.click('[data-testid="close-preview-btn"]');

      // Exporter la vue
      await page.click('[data-testid="export-view-btn"]');
      await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();

      // Télécharger l'export
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-export-btn"]');
      const download = await downloadPromise;

      // Vérifier que le fichier a été téléchargé
      expect(download.suggestedFilename()).toContain('vue-de-test-e2e');

      // Fermer la modale d'export
      await page.click('[data-testid="close-export-btn"]');
    });

    test('devrait permettre à un utilisateur normal de voir et interagir avec ses données', async ({ page }) => {
      // Se connecter en tant qu'utilisateur normal
      await viewHelper.loginAsUser(page);

      // Aller au tableau de bord
      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-container"]');

      // Vérifier que l'utilisateur voit ses widgets personnalisés
      await expect(page.locator('[data-testid="widget-my-tasks"]')).toBeVisible();
      await expect(page.locator('[data-testid="widget-my-calendar"]')).toBeVisible();

      // Interagir avec le widget des tâches
      await page.click('[data-testid="widget-my-tasks"] [data-testid="view-all-btn"]');

      // Vérifier que nous sommes redirigés vers la vue des tâches
      await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="page-title"]')).toContainText('Mes Tâches');

      // Vérifier que l'utilisateur ne voit que ses tâches
      const userTasks = await page.locator('[data-testid="table-row"]').count();
      expect(userTasks).toBeGreaterThan(0);

      // Marquer une tâche comme terminée
      await page.click('[data-testid="complete-task-btn"]:first-child');

      // Vérifier que la tâche a été marquée comme terminée
      await expect(page.locator('[data-testid="task-status"]:first-child')).toContainText('Terminée');

      // Aller au calendrier
      await page.click('[data-testid="calendar-link"]');
      await page.waitForSelector('[data-testid="calendar-view"]');

      // Vérifier que l'utilisateur voit ses événements
      const userEvents = await page.locator('[data-testid="calendar-event"]').count();
      expect(userEvents).toBeGreaterThan(0);

      // Créer un nouvel événement personnel
      await page.click('[data-testid="add-event-btn"]');
      await page.fill('[data-testid="event-title"]', 'Rendez-vous personnel');
      await page.fill('[data-testid="event-description"]', 'Rendez-vous chez le médecin');
      await page.click('[data-testid="save-event-btn"]');

      // Vérifier que l'événement a été créé
      await expect(page.locator('[data-testid="calendar-event"]')).toContainText('Rendez-vous personnel');

      // Retourner au tableau de bord
      await page.click('[data-testid="dashboard-link"]');

      // Vérifier que le widget du calendrier montre le nouvel événement
      await expect(page.locator('[data-testid="widget-my-calendar"]')).toContainText('Rendez-vous personnel');
    });

    test('devrait fonctionner correctement sur mobile', async ({ page }) => {
      // Simuler un appareil mobile
      await page.setViewportSize({ width: 375, height: 667 });

      // Se connecter
      await viewHelper.login(page);

      // Aller à ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Vérifier que la vue est responsive
      await expect(page.locator('[data-testid="mobile-menu-btn"]')).toBeVisible();

      // Ouvrir le menu mobile
      await page.click('[data-testid="mobile-menu-btn"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Naviguer vers une autre vue
      await page.click('[data-testid="mobile-kanban-link"]');
      await page.waitForSelector('[data-testid="kanban-view"]');

      // Vérifier que KanbanView est responsive
      await expect(page.locator('[data-testid="kanban-column"]')).toBeVisible();
      await expect(page.locator('[data-testid="kanban-card"]')).toBeVisible();

      // Tester le glisser-déposer sur mobile
      const taskCard = page.locator('[data-testid="kanban-card"]').first();
      const targetColumn = page.locator('[data-testid="kanban-column"]:nth-child(2)');

      // Sur mobile, on utilise un long clic puis le bouton de déplacement
      await taskCard.click({ button: 'right', delay: 1000 });
      await page.click('[data-testid="move-task-btn"]');
      await targetColumn.click();

      // Vérifier que la tâche a été déplacée
      await expect(targetColumn.locator('[data-testid="kanban-card"]')).toContainText(await taskCard.textContent());

      // Tester la création rapide sur mobile
      await page.click('[data-testid="fab-add-btn"]');
      await expect(page.locator('[data-testid="quick-create-modal"]')).toBeVisible();

      // Remplir le formulaire rapide
      await page.fill('[data-testid="quick-title"]', 'Tâche mobile');
      await page.click('[data-testid="quick-create-btn"]');

      // Vérifier que la tâche a été créée
      await expect(page.locator('[data-testid="kanban-card"]')).toContainText('Tâche mobile');

      // Restaurer la taille du bureau
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Performance et fiabilité', () => {

    test('devrait gérer de grands datasets sans dégradation de performance', async ({ page }) => {
      // Aller à ListView avec un grand dataset
      await page.goto('/views/large-dataset');
      await page.waitForSelector('[data-testid="list-view"]');

      // Mesurer le temps de chargement initial
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="table-row"]:first-child');
      const loadTime = Date.now() - startTime;

      // Le chargement devrait prendre moins de 3 secondes
      expect(loadTime).toBeLessThan(3000);

      // Vérifier que la virtualisation fonctionne
      const visibleRows = await page.locator('[data-testid="table-row"]').count();
      expect(visibleRows).toBeLessThan(50); // Seulement les lignes visibles

      // Tester le défilement
      await page.evaluate(() => {
        const container = document.querySelector('[data-testid="table-container"]');
        if (container) {
          container.scrollTop = container.scrollHeight / 2;
        }
      });

      // Attendre que de nouvelles lignes se chargent
      await page.waitForTimeout(500);

      // Vérifier que les nouvelles lignes sont chargées
      const newVisibleRows = await page.locator('[data-testid="table-row"]').count();
      expect(newVisibleRows).toBeGreaterThan(0);

      // Tester le filtrage
      await page.fill('[data-testid="search-input"]', 'test');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Mesurer le temps de filtrage
      const filterStartTime = Date.now();
      await page.waitForSelector('[data-testid="table-row"]:first-child');
      const filterTime = Date.now() - filterStartTime;

      // Le filtrage devrait prendre moins de 1 seconde
      expect(filterTime).toBeLessThan(1000);

      // Vérifier que les résultats sont filtrés
      const filteredRows = await page.locator('[data-testid="table-row"]').count();
      expect(filteredRows).toBeLessThan(visibleRows);
    });

    test('devrait récupérer gracieusement des erreurs réseau', async ({ page }) => {
      // Aller à ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Simuler une déconnexion réseau
      await page.context().setOffline(true);

      // Tenter de rafraîchir les données
      await page.click('[data-testid="refresh-btn"]');

      // Vérifier que le message hors ligne s'affiche
      await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="offline-message"]')).toContainText('Hors ligne');

      // Vérifier que les données existantes sont toujours visibles (mode hors ligne)
      await expect(page.locator('[data-testid="table-row"]')).toHaveCountGreaterThan(0);

      // Tenter de modifier des données hors ligne
      await page.click('[data-testid="edit-btn"]:first-child');
      await page.fill('[data-testid="email-input"]', 'offline@test.com');
      await page.click('[data-testid="save-btn"]');

      // Vérifier que le message de synchronisation s'affiche
      await expect(page.locator('[data-testid="sync-pending-message"]')).toBeVisible();

      // Restaurer la connexion
      await page.context().setOffline(false);

      // Attendre la synchronisation
      await page.waitForSelector('[data-testid="sync-indicator"]');
      await expect(page.locator('[data-testid="sync-indicator"]')).toBeHidden();

      // Vérifier que les modifications ont été synchronisées
      await expect(page.locator('[data-testid="table-cell"]')).toContainText('offline@test.com');
    });

    test('devrait maintenir l\'état pendant les rechargements de page', async ({ page }) => {
      // Aller à ListView
      await page.goto('/views/user-list');
      await page.waitForSelector('[data-testid="list-view"]');

      // Appliquer plusieurs filtres et tris
      await page.fill('[data-testid="search-input"]', 'admin');
      await page.press('[data-testid="search-input"]', 'Enter');

      await page.click('[data-testid="filter-btn"]');
      await page.selectOption('[data-testid="status-filter"]', 'active');
      await page.click('[data-testid="apply-filter-btn"]');

      await page.click('[data-testid="sort-btn"]');
      await page.click('[data-testid="sort-email-desc"]');

      // Changer vers KanbanView
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="kanban-view-option"]');
      await page.waitForSelector('[data-testid="kanban-view"]');

      // Recharger la page
      await page.reload();

      // Vérifier que nous sommes toujours sur KanbanView
      await expect(page.locator('[data-testid="kanban-view"]')).toBeVisible();

      // Retourner à ListView
      await page.click('[data-testid="view-type-selector"]');
      await page.click('[data-testid="list-view-option"]');
      await page.waitForSelector('[data-testid="list-view"]');

      // Vérifier que les filtres et tris sont toujours appliqués
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('admin');
      await expect(page.locator('[data-testid="active-filter-badge"]')).toBeVisible();

      // Vérifier que le tri est appliqué
      const firstRowEmail = await page.locator('[data-testid="table-row"] [data-testid="email-cell"]').first().textContent();
      const secondRowEmail = await page.locator('[data-testid="table-row"] [data-testid="email-cell"]').nth(1).textContent();

      // Vérifier que les emails sont en ordre décroissant
      expect(firstRowEmail.localeCompare(secondRowEmail)).toBeGreaterThan(0);
    });
  });
});
