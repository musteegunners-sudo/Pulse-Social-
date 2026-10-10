import { z } from 'zod';

export const CreatePostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(5000, 'Post content too long'),
  platforms: z.array(z.string()).min(1, 'Select at least one destination platform'),
  scheduledFor: z.string().optional().nullable(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
