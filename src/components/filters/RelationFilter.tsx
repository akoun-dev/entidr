import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Option pour une relation
 */
export interface RelationOption {
  /** Identifiant de l'entité */
  id: string | number;

  /** Libellé de l'entité */
  label: string;

  /** Description supplémentaire */
  description?: string;

  /** Entité désactivée */
  disabled?: boolean;

  /** Données supplémentaires */
  [key: string]: any;
}

/**
 * Props spécifiques au RelationFilter
 */
export interface RelationFilterProps extends FilterProps {
  /** Configuration du filtre relation */
  config: FilterConfig & { type: 'RELATION' };

  /** Valeur actuelle */
  value?: string | number | Array<string | number>;

  /** Options disponibles */
  options?: RelationOption[];

  /** Mode multi-sélection */
  multiple?: boolean;

  /** Placeholder personnalisé */
  placeholder?: string;

  /** Autoriser la recherche */
  searchable?: boolean;

  /** URL de chargement dynamique des options */
  loadUrl?: string;

  /** Fonction de chargement personnalisée */
  loadOptions?: (searchTerm?: string) => Promise<RelationOption[]>;

  /** Callback de changement de valeur */
  onChange?: (value: string | number | Array<string | number>) => void;

  /** Callback de chargement */
  onLoad?: (options: RelationOption[]) => void;
}

/**
 * État du RelationFilter
 */
interface RelationFilterState {
  /** Options chargées */
  options: RelationOption[];

  /** Terme de recherche */
  searchTerm: string;

  /** Est en cours de chargement */
  loading: boolean;
}

/**
 * Composant RelationFilter - Filtre pour les champs de relation
 */
export class RelationFilter extends React.Component<RelationFilterProps, RelationFilterState> {
  constructor(props: RelationFilterProps) {
    super(props);

    this.state = {
      options: props.options || [],
      searchTerm: '',
      loading: false
    };
  }

  componentDidMount(): void {
    this.loadOptions();
  }

  componentDidUpdate(prevProps: RelationFilterProps): void {
    if (prevProps.options !== this.props.options) {
      this.setState({ options: this.props.options || [] });
    }
  }

  /**
   * Charger les options
   */
  private loadOptions = async (searchTerm?: string): Promise<void> => {
    const { loadUrl, loadOptions, onLoad } = this.props;

    this.setState({ loading: true });

    try {
      let options: RelationOption[] = [];

      if (loadOptions) {
        options = await loadOptions(searchTerm);
      } else if (loadUrl) {
        // Simulation de chargement depuis une URL
        // Dans une implémentation réelle, vous utiliseriez fetch ou axios
        options = await this.mockLoadFromUrl(loadUrl, searchTerm);
      }

      this.setState({ options, loading: false });
      onLoad?.(options);
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      this.setState({ loading: false });
    }
  };

  /**
   * Simulation de chargement depuis une URL
   */
  private mockLoadFromUrl = async (url: string, searchTerm?: string): Promise<RelationOption[]> => {
    // Ceci est une simulation - dans une implémentation réelle,
    // vous feriez un appel API réel
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retourner des données factices pour la démo
    return [
      { id: 1, label: 'Option 1' },
      { id: 2, label: 'Option 2' },
      { id: 3, label: 'Option 3' }
    ].filter(option =>
      !searchTerm || option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Gérer le changement de recherche
   */
  protected handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const searchTerm = event.target.value;
    this.setState({ searchTerm }, () => {
      // Charger les options avec délai pour éviter trop de requêtes
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.loadOptions(searchTerm);
      }, 300);
    });
  };

  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const { multiple } = this.props;
    const selectElement = event.target;

    if (multiple) {
      // Mode multi-sélection
      const selectedOptions = Array.from(selectElement.selectedOptions).map(option => option.value);
      this.props.onChange?.(selectedOptions as Array<string | number>);
      this.validate(selectedOptions);
    } else {
      // Mode simple
      const value = selectElement.value;
      this.props.onChange?.(value);
      this.validate(value);
    }
  };

  /**
   * Timeout pour la recherche
   */
  private searchTimeout: NodeJS.Timeout;

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
    const {
      config,
      value = '',
      multiple = false,
      placeholder,
      searchable = false,
      disabled
    } = this.props;

    const { options, loading } = this.state;

    // Vérifier si on a besoin d'afficher un champ de recherche (pour les opérateurs like 'like')
    const needsSearch = ['like', 'not like', 'starts with', 'ends with'].includes(config.operators?.[0] || '=');

    if (needsSearch) {
      return (
        <div className="relative">
          <input
            type="text"
            value={this.state.searchTerm}
            onChange={this.handleSearchChange}
            placeholder={placeholder || config.placeholder || 'Rechercher...'}
            disabled={disabled || config.disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loading && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      );
    }

    // Mode normal : select
    return (
      <div className="relative">
        <select
          value={value}
          onChange={this.handleChange}
          multiple={multiple}
          disabled={disabled || config.disabled || loading}
          placeholder={placeholder || config.placeholder || 'Sélectionnez une option...'}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            multiple ? 'h-24' : ''
          }`}
        >
          <option value="">
            {placeholder || config.placeholder || 'Sélectionnez une option...'}
          </option>
          {options.map((option) => (
            <option
              key={option.id}
              value={option.id}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Obtenir les opérateurs valides pour ce type de filtre
   */
  static getValidOperators = (): FilterOperator[] => {
    return ['=', '!=', 'in', 'not in', 'exists', 'not exists', 'empty', 'not empty'];
  };

  /**
   * Valider une valeur pour ce type de filtre
   */
  static validateValue = (value: string | number | Array<string | number>, config: FilterConfig): boolean | string => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return !config.required || 'Ce champ est requis';
    }

    const options = config.options || [];

    if (Array.isArray(value)) {
      // Validation pour la multi-sélection
      const invalidValues = value.filter(v => !options.some(opt => opt.id === v || opt.value === v));
      if (invalidValues.length > 0) {
        return 'Certaines valeurs sélectionnées ne sont pas valides';
      }
    } else {
      // Validation pour la sélection simple
      if (!options.some(opt => opt.id === value || opt.value === value)) {
        return 'La valeur sélectionnée n\'est pas valide';
      }
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(value);
    }

    return true;
  };
}

export default RelationFilter;
