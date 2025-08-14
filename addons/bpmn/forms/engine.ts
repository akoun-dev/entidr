import { FormFieldSchema } from './types';

export const loadTaskForm = async (taskId: string): Promise<{ fields: FormFieldSchema[]; values: Record<string, any> }>
=> {
  const res = await fetch(`/api/bpmn/tasks/${taskId}/form`);
  return res.json();
};

export const saveTaskFormState = async (taskId: string, data: Record<string, any>): Promise<void> => {
  await fetch(`/api/bpmn/tasks/${taskId}/form/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const submitTaskForm = async (taskId: string, data: Record<string, any>): Promise<void> => {
  await fetch(`/api/bpmn/tasks/${taskId}/form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};
