import * as z from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user']),
  avatar: z.string().optional(),
  createdAt: z.string(),
});

export const createUserSchema = userSchema.omit({ 
  id: true,
  createdAt: true,
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;