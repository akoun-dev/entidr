export interface SecuritySetting {
  key: string;
  value: string;
  category: string;
  description?: string;
  isSensitive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
