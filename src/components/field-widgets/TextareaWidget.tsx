import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { BaseFieldWidget, FieldWidgetProps } from './FieldWidgets';

/**
 * Props spécifiques au TextareaWidget
 */
export interface TextareaWidgetProps extends FieldWidgetProps {
  /** Nombre de lignes */
  rows?: number;

  /** Nombre de colonnes */
  cols?: number;

  /** Longueur maximale */
  maxLength?: number;

  /** Longueur minimale */
  minLength?: number;

  /** Redimensionnement automatique */
  autoResize?: boolean;

  /** Mode spellcheck */
  spellCheck?: boolean;

  /** Texte d'aide en dessous */
  helpText?: string;

  /** Compteur de caractères */
  showCharCount?: boolean;

  /** Icône à gauche */
  leftIcon?: React.ReactNode;

  /** Icône à droite */
  rightIcon?: React.ReactNode;

  /** Action sur l'icône droite */
  onRightIconClick?: () => void;
}

/**
 * Widget de champ de type textarea
 */
export class TextareaWidget extends BaseFieldWidget<TextareaWidgetProps> {
  private textareaRef = React.createRef<HTMLTextAreaElement>();

  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = event.target.value;
    this.setValue(value);

    // Redimensionnement automatique si activé
    if (this.props.autoResize) {
      this.autoResize();
    }
  };

  /**
   * Redimensionner automatiquement le textarea
   */
  private autoResize = (): void => {
    const textarea = this.textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  /**
   * Rendre le widget textarea
   */
  protected renderWidget = (): React.ReactNode => {
    const {
      config,
      focused,
      invalid,
      rows = 3,
      cols,
      maxLength,
      minLength,
      autoResize,
      spellCheck,
      helpText,
      showCharCount,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className = '',
      disabled,
      readonly
    } = this.props;
    const { value } = this.state;

    const textareaClasses = [
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      invalid ? 'border-red-500 focus-visible:ring-red-500' : '',
      focused ? 'ring-2 ring-ring' : '',
      autoResize ? 'resize-none overflow-hidden' : 'resize-vertical',
      className
    ].filter(Boolean).join(' ');

    const currentLength = value ? value.toString().length : 0;
    const maxLengthReached = maxLength && currentLength >= maxLength;
    const minLengthReached = minLength && currentLength >= minLength;

    return (
      <div className="relative">
        {/* Icône gauche */}
        {leftIcon && (
          <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Textarea principal */}
        <textarea
          ref={this.textareaRef}
          value={value || ''}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          placeholder={config.placeholder}
          disabled={disabled || config.disabled}
          readOnly={readonly || config.readonly}
          required={config.required}
          rows={rows}
          cols={cols}
          maxLength={maxLength}
          minLength={minLength}
          spellCheck={spellCheck}
          className={textareaClasses}
          name={config.name}
          id={config.name}
          style={autoResize ? { height: 'auto' } : undefined}
        />

        {/* Icône droite */}
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            disabled={disabled || config.disabled}
          >
            {rightIcon}
          </button>
        )}

        {/* Compteur de caractères */}
        {showCharCount && (maxLength || minLength) && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {minLength && (
              <span className={minLengthReached ? 'text-green-600' : 'text-red-600'}>
                {currentLength}/{minLength}+
              </span>
            )}
            {maxLength && (
              <span className={maxLengthReached ? 'text-green-600' : 'text-red-600'}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Texte d'aide supplémentaire */}
        {helpText && (
          <div className="mt-1 text-xs text-muted-foreground">
            {helpText}
          </div>
        )}
      </div>
    );
  };

  componentDidMount(): void {
    super.componentDidMount();

    // Redimensionnement initial si autoResize est activé
    if (this.props.autoResize) {
      // Petit délai pour s'assurer que le DOM est prêt
      setTimeout(() => this.autoResize(), 0);
    }
  }

  componentDidUpdate(prevProps: TextareaWidgetProps): void {
    super.componentDidUpdate(prevProps);

    // Redimensionner si la valeur change et autoResize est activé
    if (this.props.autoResize && prevProps.value !== this.props.value) {
      this.autoResize();
    }
  }
}

export default TextareaWidget;
