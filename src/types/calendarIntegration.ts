export interface CalendarIntegration {
  id: string;
  provider: string;
  credentials: Record<string, unknown>;
  settings: {
    syncEnabled: boolean;
    syncFrequency?: number;
    defaultCalendar?: string;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCalendarIntegrationDto = Omit<CalendarIntegration, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCalendarIntegrationDto = Partial<CreateCalendarIntegrationDto>;
