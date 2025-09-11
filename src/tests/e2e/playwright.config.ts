import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les Tests E2E du Système de Vues Entidr
 *
 * Cette configuration définit les paramètres pour les tests end-to-end,
 * incluant les navigateurs, les rapports et les options de test.
 */

export default defineConfig({
  // Dossier où les résultats des tests seront sauvegardés
  testDir: './src/tests/e2e',

  // Exécuter les tests en parallèle
  fullyParallel: true,

  // Désactiver le mode headless pour voir les tests s'exécuter
  headless: false,

  // Nombre de workers pour l'exécution parallèle
  workers: process.env.CI ? 2 : 4,

  // Reporter pour les résultats des tests
  reporter: [
    ['list'],
    ['html'],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/test-results.xml' }],
  ],

  // Timeout pour chaque test
  timeout: 60000,

  // Timeout pour les expect
  expect: {
    timeout: 10000,
  },

  // URL de base pour les tests
  baseURL: 'http://localhost:3000',

  // Capture d'écran en cas d'échec
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  // Configuration des projets pour différents navigateurs
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Emuler le viewport desktop
        viewport: { width: 1280, height: 720 },
        // Activer les permissions pour les tests
        permissions: ['notifications', 'geolocation'],
        // Définir le timezone pour les tests cohérents
        timezoneId: 'Europe/Paris',
        // Définir la locale
        locale: 'fr-FR',
        // Désactiver les animations pour des tests plus rapides
        colorScheme: 'light',
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        permissions: ['notifications', 'geolocation'],
        timezoneId: 'Europe/Paris',
        locale: 'fr-FR',
        colorScheme: 'light',
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        permissions: ['notifications', 'geolocation'],
        timezoneId: 'Europe/Paris',
        locale: 'fr-FR',
        colorScheme: 'light',
      },
    },

    // Tests mobiles
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        permissions: ['notifications', 'geolocation'],
        timezoneId: 'Europe/Paris',
        locale: 'fr-FR',
        colorScheme: 'light',
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        permissions: ['notifications', 'geolocation'],
        timezoneId: 'Europe/Paris',
        locale: 'fr-FR',
        colorScheme: 'light',
      },
    },
  ],

  // Dossier pour les artefacts de test
  outputDir: 'test-results/',

  // Metadonnées pour les tests
  metadata: {
    testEnvironment: 'node',
    transform: {},
  },

  // Configuration du serveur web pour les tests
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Options de glob pour les fichiers de test
  testMatch: [
    '**/src/tests/e2e/**/*.test.{ts,js}',
    '**/src/tests/e2e/**/*.spec.{ts,js}',
  ],

  // Ignorer certains fichiers
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
  ],

  // Configuration du reporter
  reporterOptions: {
    outputDir: 'test-results/',
    outputFile: 'test-results.xml',
  },

  // Options de trace
  trace: {
    mode: 'retain-on-failure',
    sources: true,
    screenshots: true,
    snapshots: true,
    video: 'retain-on-failure',
  },

  // Options de screenshot
  screenshot: {
    mode: 'only-on-failure',
    fullPage: true,
  },

  // Options de vidéo
  video: {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 },
  },
});
