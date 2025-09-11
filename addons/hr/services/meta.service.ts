import { api } from '../../../src/config/api';

export interface NamedOption {
  id: string;
  name: string;
}

export const metaService = {
  async getEmploymentTypes(): Promise<NamedOption[]> {
    const res = await api.get<NamedOption[]>('/hr/meta/employment-types');
    return (res.data as any) ?? [];
  },
  async getContractTypes(): Promise<NamedOption[]> {
    const res = await api.get<NamedOption[]>('/hr/meta/contract-types');
    return (res.data as any) ?? [];
  }
};

export default metaService;

