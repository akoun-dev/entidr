import { z } from 'zod';

// Schéma pour la création d'un groupe
export const groupCreateSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional().default(true)
});

// Schéma pour la mise à jour d'un groupe
export const groupUpdateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Au moins un champ doit être fourni pour la mise à jour"
});

export type GroupCreateInput = z.infer<typeof groupCreateSchema>;
export type GroupUpdateInput = z.infer<typeof groupUpdateSchema>;
