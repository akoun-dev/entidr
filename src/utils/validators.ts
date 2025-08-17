import { z } from 'zod';

// Schéma de base pour les IDs
export const idSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

// Schéma pour la création d'utilisateur
export const userCreateSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/),
  role: z.enum(['user', 'admin']).default('user')
});

// Type pour la mise à jour d'utilisateur
type UserUpdateInput = {
  username?: string;
  email?: string;
  role?: 'user' | 'admin';
};

// Schéma pour la mise à jour d'utilisateur
export const userUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).optional()
}).refine((data: UserUpdateInput) => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});

// Fonction de validation générique
export const validateSchema = <T extends z.ZodTypeAny>(schema: T, data: unknown): {
  success: boolean;
  data?: z.infer<T>;
  error?: string
} => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((i: { message: string }) => i.message).join(', ')
    };
  }
  return { success: true, data: result.data };
};
