export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  expiresAt?: Date;
  permissions: string[];
}

export type CreateApiKeyDto = Omit<ApiKey, 'id' | 'createdAt' | 'key'>;
export type UpdateApiKeyDto = Partial<CreateApiKeyDto>;
