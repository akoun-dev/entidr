import React from 'react';

/**
 * Configuration commune à tous les widgets de champ
 */
export interface FieldWidgetConfig {
  /** Nom du champ */
  name: string;

  /** Libellé affiché */
  label?: string;

  /** Placeholder */
  placeholder?: string;

  /** Aide contextuelle */
  help?: string;

  /** Description */
  description?: string;

  /** Champ requis */
  required?: boolean;

  /** Champ en lecture seule */
  readonly?: boolean;

  /** Champ désactivé */
  disabled?: boolean;

  /** Valeur par défaut */
  defaultValue?: any;

  /** Validation */
  validation?: {
    min?: number | string;
    max?: number | string;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  };

  /** Options pour les widgets de sélection */
  options?: Array<{ value: any; label: string }>;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Événements personnalisés */
  events?: Record<string, Function>;

  /** Conditions d'affichage */
  conditions?: {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not in' | 'like';
    value: any;
  }[];
}

/**
 * Props communes à tous les widgets de champ
 */
export interface FieldWidgetProps {
  /** Configuration du widget */
  config: FieldWidgetConfig;

  /** Valeur actuelle */
  value?: any;

  /** Callback de changement de valeur */
  onChange?: (value: any) => void;

  /** Callback de validation */
  onValidate?: (isValid: boolean, errors?: string[]) => void;

  /** Callback de focus */
  onFocus?: (event: React.FocusEvent) => void;

  /** Callback de blur */
  onBlur?: (event: React.FocusEvent) => void;

  /** Callback d'appui sur une touche */
  onKeyDown?: (event: React.KeyboardEvent) => void;

  /** Callback de relâchement d'une touche */
  onKeyUp?: (event: React.KeyboardEvent) => void;

  /** Mode édition */
  editable?: boolean;

  /** Mode compact */
  compact?: boolean;

  /** Afficher les erreurs */
  showErrors?: boolean;

  /** Message d'erreur personnalisé */
  errorMessage?: string;

  /** Champ en focus */
  focused?: boolean;

  /** Champ invalide */
  invalid?: boolean;

  /** Référence DOM */
  ref?: React.Ref<any>;

  /** Attributs HTML supplémentaires */
  [key: string]: any;
}

/**
 * État d'un widget de champ
 */
export interface FieldWidgetState {
  /** Valeur interne */
  value: any;

  /** Champ en focus */
  focused: boolean;

  /** Champ touché */
  touched: boolean;

  /** Erreurs de validation */
  errors: string[];

  /** Est en cours de chargement */
  loading: boolean;

  /** Est en cours de validation */
  validating: boolean;
}

/**
 * Composant de base pour tous les widgets de champ
 */
export abstract class BaseFieldWidget<T extends FieldWidgetProps = FieldWidgetProps>
  extends React.Component<T, FieldWidgetState> {

  constructor(props: T) {
    super(props);
    this.state = {
      value: props.value ?? props.config?.defaultValue,
      focused: false,
      touched: false,
      errors: [],
      loading: false,
      validating: false,
    };
  }

  /**
   * Mettre à jour la valeur
   */
  protected setValue = (value: any): void => {
    this.setState({ value, touched: true }, () => {
      this.props.onChange?.(value);
      this.validate();
    });
  };

  /**
   * Valider la valeur actuelle
   */
  protected validate = (): boolean => {
    const { config } = this.props;
    const { value } = this.state;
    const errors: string[] = [];

    // Validation requise
    if (config.required && (value === null || value === undefined || value === '')) {
      errors.push('Ce champ est requis');
    }

    // Validation personnalisée
    if (config.validation?.custom) {
      const customResult = config.validation.custom(value);
      if (customResult !== true) {
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else {
          errors.push('La valeur est invalide');
        }
      }
    }

    // Validation par pattern
    if (config.validation?.pattern && typeof value === 'string') {
      const regex = new RegExp(config.validation.pattern);
      if (!regex.test(value)) {
        errors.push('Le format est invalide');
      }
    }

    // Validation min/max pour les nombres
    if (typeof value === 'number') {
      if (config.validation?.min !== undefined) {
        const minValue = typeof config.validation.min === 'string'
          ? parseFloat(config.validation.min)
          : config.validation.min;
        if (!isNaN(minValue) && value < minValue) {
          errors.push(`La valeur doit être supérieure ou égale à ${config.validation.min}`);
        }
      }
      if (config.validation?.max !== undefined) {
        const maxValue = typeof config.validation.max === 'string'
          ? parseFloat(config.validation.max)
          : config.validation.max;
        if (!isNaN(maxValue) && value > maxValue) {
          errors.push(`La valeur doit être inférieure ou égale à ${config.validation.max}`);
        }
      }
    }

    // Validation min/max pour les chaînes
    if (typeof value === 'string') {
      if (config.validation?.min !== undefined) {
        const minLength = typeof config.validation.min === 'string'
          ? parseInt(config.validation.min, 10)
          : config.validation.min;
        if (!isNaN(minLength) && value.length < minLength) {
          errors.push(`La longueur doit être supérieure ou égale à ${config.validation.min}`);
        }
      }
      if (config.validation?.max !== undefined) {
        const maxLength = typeof config.validation.max === 'string'
          ? parseInt(config.validation.max, 10)
          : config.validation.max;
        if (!isNaN(maxLength) && value.length > maxLength) {
          errors.push(`La longueur doit être inférieure ou égale à ${config.validation.max}`);
        }
      }
    }

    this.setState({ errors });
    const isValid = errors.length === 0;
    this.props.onValidate?.(isValid, errors);
    return isValid;
  };

  /**
   * Gérer le focus
   */
  protected handleFocus = (event: React.FocusEvent): void => {
    this.setState({ focused: true });
    this.props.onFocus?.(event);
  };

  /**
   * Gérer le blur
   */
  protected handleBlur = (event: React.FocusEvent): void => {
    this.setState({ focused: false, touched: true });
    this.validate();
    this.props.onBlur?.(event);
  };

  /**
   * Gérer le changement
   */
  protected abstract handleChange: (event: React.ChangeEvent<any> | any) => void;

  /**
   * Rendre le widget
   */
  protected abstract renderWidget: () => React.ReactNode;

  /**
   * Rendre le label
   */
  protected renderLabel = (): React.ReactNode => {
    const { config } = this.props;
    if (!config.label) return null;

    return (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  };

  /**
   * Rendre l'aide contextuelle
   */
  protected renderHelp = (): React.ReactNode => {
    const { config } = this.props;
    if (!config.help) return null;

    return (
      <p className="text-xs text-gray-500 mt-1">
        {config.help}
      </p>
    );
  };

  /**
   * Rendre les erreurs
   */
  protected renderErrors = (): React.ReactNode => {
    const { showErrors = true, errorMessage } = this.props;
    const { errors, touched } = this.state;

    if (!showErrors || !touched || errors.length === 0) return null;

    return (
      <div className="text-red-500 text-xs mt-1">
        {errorMessage || errors.join(', ')}
      </div>
    );
  };

  /**
   * Rendre la description
   */
  protected renderDescription = (): React.ReactNode => {
    const { config } = this.props;
    if (!config.description) return null;

    return (
      <p className="text-sm text-gray-600 mt-1">
        {config.description}
      </p>
    );
  };

  componentDidMount(): void {
    if (this.props.value !== undefined) {
      this.setState({ value: this.props.value });
    }
  }

  componentDidUpdate(prevProps: T): void {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  render(): React.ReactNode {
    const { config, className = '', style, focused, invalid } = this.props;
    const { errors } = this.state;

    const containerClasses = [
      'field-widget',
      config.required ? 'required' : '',
      config.readonly ? 'readonly' : '',
      config.disabled ? 'disabled' : '',
      focused || this.state.focused ? 'focused' : '',
      invalid || errors.length > 0 ? 'invalid' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses} style={style}>
        {this.renderLabel()}
        {this.renderWidget()}
        {this.renderHelp()}
        {this.renderErrors()}
        {this.renderDescription()}
      </div>
    );
  }
}

/**
 * Composant conteneur pour les widgets de champ
 */
export const FieldWidgets: React.FC = () => {
  return (
    <div className="field-widgets-container">
      <p>Field Widgets Container</p>
    </div>
  );
};

export default FieldWidgets;
