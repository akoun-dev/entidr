import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { FormFieldSchema } from './types';
import { encrypt, encryptFile } from './encryption';

interface DynamicFormProps {
  fields: FormFieldSchema[];
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onSaveState?: (data: Record<string, any>) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fields, initialValues = {}, onSubmit, onSaveState }) => {
  const form = useForm({ defaultValues: initialValues });

  useEffect(() => {
    const subscription = form.watch((value) => {
      onSaveState?.(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onSaveState]);

  const renderField = (field: FormFieldSchema) => {
    const hidden = field.conditional && form.watch(field.conditional.field) !== field.conditional.value;
    if (hidden) return null;

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <FormField
            control={form.control}
            name={field.name}
            rules={{ required: field.required }}
            render={({ field: rhf }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input type={field.type === 'text' ? 'text' : field.type} {...rhf} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'attachment':
        return (
          <FormField
            control={form.control}
            name={field.name}
            rules={{ required: field.required }}
            render={({ field: rhf }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input type="file" onChange={(e) => rhf.onChange(e.target.files)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    const processed: Record<string, any> = {};
    for (const field of fields) {
      let value = data[field.name];
      if (field.type === 'attachment' && value instanceof FileList) {
        const files = await Promise.all(Array.from(value).map(encryptFile));
        processed[field.name] = files;
        continue;
      }
      if (field.pii && value) {
        value = encrypt(String(value));
      }
      processed[field.name] = value;
    }
    onSubmit(processed);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {fields.map((f) => (
          <React.Fragment key={f.name}>{renderField(f)}</React.Fragment>
        ))}
        <Button type="submit">Soumettre</Button>
      </form>
    </Form>
  );
};

export default DynamicForm;
