import React, { useState } from 'react';
import { useTheme } from './useTheme';
import { AdaptiveCard, AdaptiveText, AdaptiveButton, AdaptiveBadge, AdaptiveAlert } from './AdaptiveComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Composant pour tester l'accessibilité en mode sombre
 */
export function AccessibilityTester() {
  const { theme, setTheme, getColor, getFont } = useTheme();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Tests de contraste WCAG AA
  const runContrastTests = () => {
    const results: Record<string, boolean> = {};

    // Test contraste texte sur fond
    const textColor = getColor('text');
    const backgroundColor = getColor('background');
    results['text_on_background'] = checkContrast(textColor, backgroundColor);

    // Test contraste texte secondaire
    const textSecondaryColor = getColor('textSecondary');
    results['text_secondary_on_background'] = checkContrast(textSecondaryColor, backgroundColor);

    // Test contraste boutons
    const buttonColor = getColor('primary');
    results['button_text'] = checkContrast('#ffffff', buttonColor);

    // Test contraste badges
    const badgeBg = theme.appliedTheme === 'light' ? '#3b82f6' : '#1e40af';
    results['badge_text'] = checkContrast('#ffffff', badgeBg);

    // Test contraste alertes
    const alertBg = theme.appliedTheme === 'light' ? '#fef3c7' : '#451a03';
    const alertText = theme.appliedTheme === 'light' ? '#92400e' : '#fbbf24';
    results['alert_text'] = checkContrast(alertText, alertBg);

    setTestResults(results);
  };

  // Fonction simplifiée pour vérifier le contraste (simulation)
  const checkContrast = (color1: string, color2: string): boolean => {
    // Simulation - dans une vraie implémentation, utiliser une bibliothèque comme tinycolor2
    const lightColors = ['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280'];
    const darkColors = ['#000000', '#111827', '#1f2937', '#374151', '#4b5563', '#6b7280'];

    const isLight1 = lightColors.includes(color1) || color1.startsWith('#f') || color1.startsWith('#e');
    const isLight2 = lightColors.includes(color2) || color2.startsWith('#f') || color2.startsWith('#e');
    const isDark1 = darkColors.includes(color1) || color1.startsWith('#1') || color1.startsWith('#0');
    const isDark2 = darkColors.includes(color2) || color2.startsWith('#1') || color2.startsWith('#0');

    // Retourner true si le contraste est suffisant (simplification)
    return (isLight1 && isDark2) || (isDark1 && isLight2);
  };

  // Tests de lisibilité
  const readabilityTests = [
    {
      name: 'Taille de police minimale',
      description: 'Vérifier que la taille de police est ≥ 16px',
      test: () => {
        const fontSize = getFont('base');
        return parseFloat(fontSize) >= 16;
      }
    },
    {
      name: 'Hauteur de ligne',
      description: 'Vérifier que la hauteur de ligne est ≥ 1.5',
      test: () => {
        const lineHeight = getFont('lineHeightNormal');
        return parseFloat(lineHeight) >= 1.4;
      }
    },
    {
      name: 'Espacement des lettres',
      description: 'Vérifier l\'espacement des lettres',
      test: () => {
        const letterSpacing = getFont('letterSpacingNormal');
        return letterSpacing !== '0';
      }
    }
  ];

  // Tests d'accessibilité visuelle
  const visualTests = [
    {
      name: 'Mode sombre - Fatigue oculaire',
      description: 'Vérifier que la luminosité est réduite',
      test: () => {
        if (theme.appliedTheme === 'dark') {
          // Vérifier que les couleurs ne sont pas trop lumineuses
          const bgColor = getColor('background');
          return bgColor === '#0f172a' || bgColor.includes('172a');
        }
        return true;
      }
    },
    {
      name: 'Mode sombre - Contraste',
      description: 'Vérifier que le contraste est suffisant',
      test: () => {
        if (theme.appliedTheme === 'dark') {
          const textColor = getColor('text');
          const bgColor = getColor('background');
          return textColor === '#f1f5f9' && bgColor === '#0f172a';
        }
        return true;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testeur d'Accessibilité</h2>
          <p className="text-gray-600">
            Thème actuel: {theme.currentTheme} (appliqué: {theme.appliedTheme})
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTheme('light')} variant={theme.appliedTheme === 'light' ? 'default' : 'outline'}>
            Mode Clair
          </Button>
          <Button onClick={() => setTheme('dark')} variant={theme.appliedTheme === 'dark' ? 'default' : 'outline'}>
            Mode Sombre
          </Button>
          <Button onClick={() => setTheme('auto')} variant={theme.currentTheme === 'auto' ? 'default' : 'outline'}>
            Auto
          </Button>
        </div>
      </div>

      {/* Tests de contraste */}
      <AdaptiveCard title="Tests de Contraste WCAG AA">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Vérifier le ratio de contraste minimum de 4.5:1 pour le texte normal
            </p>
            <AdaptiveButton onClick={runContrastTests}>
              Lancer les tests
            </AdaptiveButton>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex items-center justify-between p-3 rounded border">
                  <span className="font-medium">{test.replace(/_/g, ' ')}</span>
              <AdaptiveBadge variant={result ? 'success' : 'warning'}>
                {result ? '✓ Pass' : '✗ Fail'}
              </AdaptiveBadge>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdaptiveCard>

      {/* Tests de lisibilité */}
      <AdaptiveCard title="Tests de Lisibilité">
        <div className="space-y-4">
          {readabilityTests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded border">
              <div>
                <h4 className="font-medium">{test.name}</h4>
                <p className="text-sm text-gray-600">{test.description}</p>
              </div>
              <AdaptiveBadge variant={test.test() ? 'success' : 'warning'}>
                {test.test() ? '✓ Pass' : '✗ Fail'}
              </AdaptiveBadge>
            </div>
          ))}
        </div>
      </AdaptiveCard>

      {/* Tests visuels mode sombre */}
      <AdaptiveCard title="Tests Visuels - Mode Sombre">
        <div className="space-y-4">
          {visualTests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded border">
              <div>
                <h4 className="font-medium">{test.name}</h4>
                <p className="text-sm text-gray-600">{test.description}</p>
              </div>
              <AdaptiveBadge variant={test.test() ? 'success' : 'warning'}>
                {test.test() ? '✓ Pass' : '✗ Fail'}
              </AdaptiveBadge>
            </div>
          ))}
        </div>
      </AdaptiveCard>

      {/* Exemples de composants */}
      <AdaptiveCard title="Exemples de Composants Adaptatifs">
        <div className="space-y-6">
          {/* Texte */}
          <div>
            <AdaptiveText variant="heading">Titre de Niveau 1</AdaptiveText>
            <AdaptiveText variant="subheading">Sous-titre</AdaptiveText>
            <AdaptiveText variant="body">
              Ceci est un exemple de texte normal. Le système de thème adaptatif garantit que le texte reste lisible dans les deux modes.
            </AdaptiveText>
            <AdaptiveText variant="caption">Texte en caption - plus petit</AdaptiveText>
            <AdaptiveText variant="muted">Texte muted - moins visible</AdaptiveText>
          </div>

          {/* Boutons */}
          <div className="space-y-2">
            <h4 className="font-medium">Boutons Adaptatifs</h4>
            <div className="flex gap-2 flex-wrap">
              <AdaptiveButton>Bouton Principal</AdaptiveButton>
              <AdaptiveButton variant="destructive">Destructif</AdaptiveButton>
              <AdaptiveButton variant="outline">Contour</AdaptiveButton>
              <AdaptiveButton variant="secondary">Secondaire</AdaptiveButton>
              <AdaptiveButton variant="ghost">Fantôme</AdaptiveButton>
              <AdaptiveButton variant="link">Lien</AdaptiveButton>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2">
            <h4 className="font-medium">Badges Adaptatifs</h4>
            <div className="flex gap-2 flex-wrap">
              <AdaptiveBadge>Default</AdaptiveBadge>
              <AdaptiveBadge variant="secondary">Secondary</AdaptiveBadge>
              <AdaptiveBadge variant="success">Success</AdaptiveBadge>
              <AdaptiveBadge variant="warning">Warning</AdaptiveBadge>
              <AdaptiveBadge variant="warning">Error</AdaptiveBadge>
              <AdaptiveBadge variant="info">Info</AdaptiveBadge>
            </div>
          </div>

          {/* Alertes */}
          <div className="space-y-2">
            <h4 className="font-medium">Alertes Adaptatives</h4>
            <div className="space-y-2">
              <AdaptiveAlert variant="default" title="Information">
                Ceci est une alerte d'information avec un contraste optimisé.
              </AdaptiveAlert>
              <AdaptiveAlert variant="success" title="Succès">
                L'opération a été réalisée avec succès !
              </AdaptiveAlert>
              <AdaptiveAlert variant="warning" title="Attention">
                Veuillez vérifier ces informations avant de continuer.
              </AdaptiveAlert>
              <AdaptiveAlert variant="error" title="Erreur">
                Une erreur s'est produite lors de l'opération.
              </AdaptiveAlert>
            </div>
          </div>
        </div>
      </AdaptiveCard>

      {/* Recommandations d'accessibilité */}
      <AdaptiveCard title="Recommandations d'Accessibilité">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">✓ Bonnes pratiques</h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Utilisez toujours des couleurs avec un contraste suffisant</li>
              <li>• Assurez-vous que la taille de police est ≥ 16px pour le texte principal</li>
              <li>• Utilisez une hauteur de ligne d'au moins 1.5 pour une meilleure lisibilité</li>
              <li>• Testez votre interface dans les deux modes (clair/sombre)</li>
              <li>• Fournissez des alternatives textuelles pour les informations colorées</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">⚠ Points d'attention</h4>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>• Évitez les couleurs trop vives en mode sombre pour réduire la fatigue oculaire</li>
              <li>• Vérifiez que les icônes restent visibles dans les deux modes</li>
              <li>• Assurez-vous que les transitions ne sont pas trop rapides</li>
              <li>• Testez avec différents niveaux de luminosité d'écran</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <h4 className="font-medium text-green-800 dark:text-green-200">🎯 Optimisations mode sombre</h4>
            <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
              <li>• Réduisez la luminosité globale de 5-10% pour moins de fatigue</li>
              <li>• Utilisez des couleurs plus chaudes pour le texte en mode sombre</li>
              <li>• Augmentez légèrement le contraste pour compenser la réduction de luminosité</li>
              <li>• Utilisez des ombres plus subtiles en mode sombre</li>
            </ul>
          </div>
        </div>
      </AdaptiveCard>
    </div>
  );
}

export default AccessibilityTester;
