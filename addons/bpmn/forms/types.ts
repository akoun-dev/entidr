export type FieldType = 'text' | 'number' | 'date' | 'attachment';

export interface ConditionalDisplay {
  field: string;
  value: any;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  conditional?: ConditionalDisplay;
  pii?: boolean;
}
