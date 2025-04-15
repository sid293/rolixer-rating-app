import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  password: z.string().min(6),
  address: z.string().max(400).optional(),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']).default('USER'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const storeSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  address: z.string().max(400).optional(),
});

export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export type CreateUserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStoreInput = z.infer<typeof storeSchema>;
export type CreateRatingInput = z.infer<typeof ratingSchema>;