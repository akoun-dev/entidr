// Export du composant principal
export { FilterBuilder as default } from './FilterBuilder';

// Export des composants de filtres
export { FilterPanel } from './FilterPanel';
export { TextFilter } from './TextFilter';
export { NumberFilter } from './NumberFilter';
export { DateFilter } from './DateFilter';
export { SelectFilter } from './SelectFilter';
export { BooleanFilter } from './BooleanFilter';
export { RelationFilter } from './RelationFilter';
export { CustomFilter } from './CustomFilter';

// Export des types
export type {
  FilterConfig,
  FilterProps,
  FilterBuilderProps,
  FilterPanelProps,
  FilterType,
  FilterOperator,
  FilterCondition,
  FilterGroup,
  FilterLogic
} from './FilterBuilder';

// Export des utilitaires et constantes
export const FILTER_TYPES = [
  'TEXT',
  'NUMBER',
  'DATE',
  'SELECT',
  'BOOLEAN',
  'RELATION',
  'CUSTOM'
] as const;

export type FilterType = typeof FILTER_TYPES[number];

export const FILTER_OPERATORS = {
  TEXT: ['=', '!=', 'like', 'not like', 'starts with', 'ends with', 'empty', 'not empty'],
  NUMBER: ['=', '!=', '>', '<', '>=', '<=', 'between', 'not between', 'empty', 'not empty'],
  DATE: ['=', '!=', '>', '<', '>=', '<=', 'between', 'not between', 'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year', 'empty', 'not empty'],
  SELECT: ['=', '!=', 'in', 'not in', 'empty', 'not empty'],
  BOOLEAN: ['=', '!=', 'true', 'false', 'empty'],
  RELATION: ['=', '!=', 'in', 'not in', 'exists', 'not exists', 'empty', 'not empty'],
  CUSTOM: ['custom']
} as const;

export const FILTER_LOGIC = ['AND', 'OR'] as const;

export type FilterLogic = typeof FILTER_LOGIC[number];

// Export des services
export { FilterService } from './FilterService';
