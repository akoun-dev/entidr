// Export du composant principal
export { FieldWidgets as default } from './FieldWidgets';

// Export des widgets de base
export { InputWidget } from './InputWidget';
export { TextareaWidget } from './TextareaWidget';
export { SelectWidget } from './SelectWidget';
export { MultiSelectWidget } from './MultiSelectWidget';
export { CheckboxWidget } from './CheckboxWidget';
export { RadioWidget } from './RadioWidget';
export { DateWidget } from './DateWidget';
export { DateTimeWidget } from './DateTimeWidget';
export { TimeWidget } from './TimeWidget';
export { NumberWidget } from './NumberWidget';
export { CurrencyWidget } from './CurrencyWidget';
export { EmailWidget } from './EmailWidget';
export { PhoneWidget } from './PhoneWidget';
export { UrlWidget } from './UrlWidget';
export { PasswordWidget } from './PasswordWidget';
export { ColorWidget } from './ColorWidget';
export { FileWidget } from './FileWidget';
export { ImageWidget } from './ImageWidget';
export { RichTextWidget } from './RichTextWidget';
export { CodeWidget } from './CodeWidget';
export { RatingWidget } from './RatingWidget';
export { TagsWidget } from './TagsWidget';
export { RelationWidget } from './RelationWidget';
export { ReferenceWidget } from './ReferenceWidget';
export { ComputedWidget } from './ComputedWidget';
export { BooleanWidget } from './BooleanWidget';
export { SliderWidget } from './SliderWidget';
export { SwitchWidget } from './SwitchWidget';
export { BadgeWidget } from './BadgeWidget';
export { AvatarWidget } from './AvatarWidget';
export { SignatureWidget } from './SignatureWidget';
export { LocationWidget } from './LocationWidget';
export { ProgressWidget } from './ProgressWidget';

// Export des types
export type { FieldWidgetProps, FieldWidgetConfig } from './FieldWidgets';

// Export des utilitaires et constantes
export const FIELD_WIDGET_TYPES = [
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'MULTISELECT',
  'CHECKBOX',
  'RADIO',
  'DATE',
  'DATETIME',
  'TIME',
  'NUMBER',
  'CURRENCY',
  'EMAIL',
  'PHONE',
  'URL',
  'PASSWORD',
  'COLOR',
  'FILE',
  'IMAGE',
  'RICHTEXT',
  'CODE',
  'RATING',
  'TAGS',
  'RELATION',
  'REFERENCE',
  'COMPUTED',
  'BOOLEAN',
  'SLIDER',
  'SWITCH',
  'BADGE',
  'AVATAR',
  'SIGNATURE',
  'LOCATION',
  'PROGRESS'
] as const;

export type FieldWidgetType = typeof FIELD_WIDGET_TYPES[number];
