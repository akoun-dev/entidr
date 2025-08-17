import { api } from '@/config/api';
import type { CalendarIntegration } from '@/types/calendarIntegration';

export const calendarIntegrationService = {
  async list(): Promise<CalendarIntegration[]> {
    const response = await api.get('/calendar-integrations');
    return response.data;
  },

  async create(integration: Omit<CalendarIntegration, 'id'>): Promise<CalendarIntegration> {
    const response = await api.post('/calendar-integrations', integration);
    return response.data;
  },

  async update(id: string, updates: Partial<CalendarIntegration>): Promise<CalendarIntegration> {
    const response = await api.patch(`/calendar-integrations/${id}`, updates);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/calendar-integrations/${id}`);
  }
};
