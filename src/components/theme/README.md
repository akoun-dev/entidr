# Système de Thème Adaptatif avec Accessibilité Mode Sombre

Ce système de thème fournit une solution complète pour gérer les thèmes clair/sombre avec un accent particulier sur l'accessibilité en mode sombre.

## 🚀 Fonctionnalités

### Thème Adaptatif
- **Mode Clair**: Thème par défaut avec couleurs optimisées pour la lisibilité
- **Mode Sombre**: Thème optimisé pour réduire la fatigue oculaire
- **Mode Auto**: Détection automatique selon les préférences système
- **Transitions Douces**: Animations fluides entre les changements de thème

### Accessibilité Mode Sombre
- **Contraste Optimisé**: Respect des normes WCAG AA (4.5:1 minimum)
- **Réduction de Fatigue Oculaire**: Luminosité réduite de 5-10%
- **Couleurs Chaudes**: Texte en tons plus chauds pour le confort visuel
- **Polices Adaptatives**: Taille et espacement optimisés

### Composants Adaptatifs
- **AdaptiveCard**: Cartes qui s'adaptent au thème
- **AdaptiveButton**: Boutons avec contraste optimisé
- **AdaptiveBadge**: Badges avec visibilité adaptative
- **AdaptiveAlert**: Alertes accessibles
- **AdaptiveText**: Texte avec lisibilité optimisée
- **AdaptiveContainer**: Conteneurs avec espacement adaptatif

## 📦 Installation

```typescript
// Importer le système de thème
import { useTheme, AdaptiveCard, AdaptiveButton } from '@/components/theme';
```

## 🎯 Utilisation

### Hook Principal
```typescript
const { theme, setTheme, appliedTheme, getColor, getFont } = useTheme();

// Changer de thème
setTheme('light');  // Mode clair
setTheme('dark');   // Mode sombre
setTheme('auto');   // Mode automatique
```

### Composants Adaptatifs
```typescript
// Carte adaptative
<AdaptiveCard title="Mon Titre">
  <p>Contenu qui s'adapte au thème</p>
</AdaptiveCard>

// Bouton adaptatif
<AdaptiveButton variant="primary">Action</AdaptiveButton>

// Texte adaptatif
<AdaptiveText variant="heading">Titre</AdaptiveText>
<AdaptiveText variant="body">Texte normal</AdaptiveText>
```

### Hook Utilitaire
```typescript
const { classes, isDarkMode, isLightMode } = useAdaptiveTheme();

// Classes CSS adaptatives
<div className={classes.background}>Fond adaptatif</div>
<div className={classes.text}>Texte adaptatif</div>
```

## 🧪 Test d'Accessibilité

Le système inclut un composant de test d'accessibilité :

```typescript
import { AccessibilityTester } from '@/components/theme';

function App() {
  return (
    <div>
      <AccessibilityTester />
      {/* Votre application */}
    </div>
  );
}
```

Le testeur fournit :
- Tests de contraste WCAG AA
- Tests de lisibilité
- Tests visuels mode sombre
- Exemples de composants
- Recommandations d'accessibilité

## 🔧 Configuration

### Personnalisation des Couleurs
```typescript
// Dans useTheme.ts
const colorPalettes: Record<ThemeType, ColorPalette> = {
  light: {
    // Couleurs mode clair
  },
  dark: {
    // Couleurs mode sombre
  }
};
```

### Personnalisation des Polices
```typescript
// Configuration des polices
const fontConfigs: Record<ThemeType, FontConfig> = {
  light: { /* ... */ },
  dark: { /* ... */ }
};
```

## 📱 Performance

- **Chargement Lazy**: Les composants sont chargés uniquement si nécessaires
- **Mémoization**: Les valeurs de thème sont mémorisées pour éviter les recalculs
- **Effets Optimisés**: Utilisation de useEffect avec dépendances précises
- **CSS Optimisé**: Transitions hardware-accelerated

## ♿ Accessibilité

### Normes Respectées
- **WCAG 2.1 AA**: Contraste minimum de 4.5:1
- **ARIA**: Composants avec attributs ARIA appropriés
- **Keyboard Navigation**: Navigation au clavier complète
- **Screen Reader**: Compatibilité avec lecteurs d'écran

### Optimisations Mode Sombre
- **Luminosité Réduite**: -5% à -10% par rapport au mode clair
- **Température de Couleur**: Texte en tons plus chauds (3000K-4000K)
- **Contraste Augmenté**: +10% pour compenser la réduction de luminosité
- **Ombres Adoucies**: Ombres plus subtiles et moins dures

## 🎨 Design System

### Palette de Couleurs
- **Primaire**: Bleu adaptatif (#3b82f6 → #1e40af)
- **Secondaire**: Gris adaptatif (#6b7280 → #9ca3af)
- **Succès**: Vert adaptatif (#10b981 → #059669)
- **Attention**: Jaune adaptatif (#f59e0b → #d97706)
- **Erreur**: Rouge adaptatif (#ef4444 → #dc2626)

### Typographie
- **Taille de Base**: 16px minimum
- **Hauteur de Ligne**: 1.5 minimum
- **Espacement des Lettres**: 0.025em pour une meilleure lisibilité
- **Poids des Polices**: 400-600 pour un bon contraste

## 📚 Documentation

### API Référence

#### useTheme()
```typescript
interface ThemeHookResult {
  theme: ThemeState;
  setTheme: (theme: ThemeType) => void;
  appliedTheme: 'light' | 'dark';
  getColor: (key: string) => string;
  getFont: (key: string) => string;
  getSpacing: (key: string) => string;
}
```

#### Composants
- **AdaptiveCard**: Props `title`, `description`, `children`, `className`
- **AdaptiveButton**: Props `variant`, `size`, `children`, `className`
- **AdaptiveBadge**: Props `variant`, `children`, `className`
- **AdaptiveAlert**: Props `variant`, `title`, `children`, `className`
- **AdaptiveText**: Props `variant`, `children`, `className`
- **AdaptiveContainer**: Props `maxWidth`, `children`, `className`

### Bonnes Pratiques

1. **Utilisez toujours les composants adaptatifs** pour une cohérence visuelle
2. **Testez dans les deux modes** pour vérifier l'accessibilité
3. **Évitez les couleurs codées en dur**, utilisez `getColor()`
4. **Respectez les ratios de contraste** minimum de 4.5:1
5. **Utilisez des tailles de police ≥ 16px** pour le texte principal

## 🤝 Contribution

1. Fork le projet
2. Créez une branche de fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour les détails

---

**Note**: Ce système de thème est conçu pour être évolutif et personnalisable. N'hésitez pas à adapter les couleurs, polices et configurations selon vos besoins spécifiques.
