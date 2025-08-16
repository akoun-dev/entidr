# Standards de Développement

## Structure de Code
- 2 espaces pour l'indentation
- Semicolons obligatoires
- Nommage :
  - Classes : PascalCase (ex: `AddonManager`)
  - Variables : camelCase
  - Constantes : UPPER_CASE

## React/TypeScript
- Components : Fonctions avec hooks
- Props : Typées explicitement
- Hooks : Préfixe `use` (ex: `useAuth`)
- Pas de `any` toléré

## Git
- Commit messages en anglais
- Convention : `type(scope): description`
  - ex: `feat(auth): add login form`
- Branches : `feature/name` ou `fix/name`

## Tests
- Couverture minimale : 80%
- Fichiers de test : `.test.ts` à côté du code
- Tests E2E : dossier `cypress/`
