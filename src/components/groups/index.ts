/**
 * Exports du système de groupement
 */

// Types et interfaces
export * from './GroupTypes';

// Composants principaux
export { GroupBuilder } from './GroupBuilder';
export { GroupPanel } from './GroupPanel';

// Types de groupes
export { FieldGroup } from './FieldGroup';
export { DateGroup } from './DateGroup';
export { RelationGroup } from './RelationGroup';
export { CustomGroup } from './CustomGroup';

// Composant de base
export { BaseGroup } from './GroupBuilder';

// Réexport par défaut pour faciliter l'import
export { GroupBuilder as defaultGroupBuilder } from './GroupBuilder';
export { GroupPanel as defaultGroupPanel } from './GroupPanel';
export { FieldGroup as defaultFieldGroup } from './FieldGroup';
export { DateGroup as defaultDateGroup } from './DateGroup';
export { RelationGroup as defaultRelationGroup } from './RelationGroup';
export { CustomGroup as defaultCustomGroup } from './CustomGroup';
