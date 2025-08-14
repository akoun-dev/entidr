import React, { useEffect, useState } from 'react';
import DynamicForm from './DynamicForm';
import { FormFieldSchema } from './types';
import { loadTaskForm, saveTaskFormState, submitTaskForm } from './engine';

interface Props {
  taskId: string;
}

const UserTaskForm: React.FC<Props> = ({ taskId }) => {
  const [fields, setFields] = useState<FormFieldSchema[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    loadTaskForm(taskId).then((res) => {
      setFields(res.fields);
      setValues(res.values || {});
    });
  }, [taskId]);

  if (!fields.length) return null;

  return (
    <DynamicForm
      fields={fields}
      initialValues={values}
      onSubmit={(data) => submitTaskForm(taskId, data)}
      onSaveState={(data) => saveTaskFormState(taskId, data)}
    />
  );
};

export default UserTaskForm;
