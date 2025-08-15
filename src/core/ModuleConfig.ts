import { z } from 'zod';

export const ModuleDependencySchema = z.object({
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  optional: z.boolean().default(false)
});

export const ModuleAPISchema = z.object({
  name: z.string(),
  version: z.string(),
  dependencies: z.array(ModuleDependencySchema).default([]),
  scopedStyles: z.boolean().default(true),
  sandbox: z.boolean().default(false),
  api: z.record(z.function()).optional()
});

export type ModuleConfig = z.infer<typeof ModuleAPISchema>;

export const validateModuleConfig = (config: unknown): ModuleConfig => {
  return ModuleAPISchema.parse(config);
};