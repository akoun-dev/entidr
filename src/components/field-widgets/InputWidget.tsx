import React from 'react';
import { Input } from '@/components/ui/input';
import { BaseFieldWidget, FieldWidgetProps } from './FieldWidgets';

/**
 * Props spécifiques au InputWidget
 */
export interface InputWidgetProps extends FieldWidgetProps {
  /** Type d'input */
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'search';

  /** Longueur maximale */
  maxLength?: number;

  /** Longueur minimale */
  minLength?: number;

  /** Autocomplétion */
  autoComplete?: string;

  /** Mode spellcheck */
  spellCheck?: boolean;

  /** Prefixe */
  prefix?: string;

  /** Suffixe */
  suffix?: string;

  /** Icône à gauche */
  leftIcon?: React.ReactNode;

  /** Icône à droite */
  rightIcon?: React.ReactNode;

  /** Action sur l'icône droite */
  onRightIconClick?: () => void;
}

/**
 * Widget de champ de type input
 */
export class InputWidget extends BaseFieldWidget<InputWidgetProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    this.setValue(value);
  };

  /**
   * Rendre le widget input
   */
  protected renderWidget = (): React.ReactNode => {
    const { config, focused, invalid, type = 'text', maxLength, minLength, autoComplete, spellCheck, prefix, suffix, leftIcon, rightIcon, onRightIconClick, className = '', disabled, readonly } = this.props;
    const { value } = this.state;

    const inputClasses = [
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      prefix ? 'pl-16' : '',
      suffix ? 'pr-16' : '',
      invalid ? 'border-red-500 focus-visible:ring-red-500' : '',
      focused ? 'ring-2 ring-ring' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="relative">
        {/* Préfixe */}
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {prefix}
          </div>
        )}

        {/* Icône gauche */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Input principal */}
        <input
          type={type}
          value={value || ''}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          placeholder={config.placeholder}
          disabled={disabled || config.disabled}
          readOnly={readonly || config.readonly}
          required={config.required}
          maxLength={maxLength}
          minLength={minLength}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          className={inputClasses}
          name={config.name}
          id={config.name}
        />

        {/* Suffixe */}
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {suffix}
          </div>
        )}

        {/* Icône droite */}
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            disabled={disabled || config.disabled}
          >
            {rightIcon}
          </button>
        )}
      </div>
    );
  };
}

export default InputWidget;
