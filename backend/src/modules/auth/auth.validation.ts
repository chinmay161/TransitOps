import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Must be a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const verifyEmailSchema = z.object({
  token: z
    .string({ required_error: 'Verification token is required' })
    .min(1, 'Verification token is required'),
});

// Admin creates Fleet Manager with temporary password
export const createFleetManagerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Must be a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name is required'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-\(\)]{7,20}$/, 'Invalid phone number format')
    .optional()
    .nullable()
    .default(null),
});

const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Must be a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name is required'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-\(\)]{7,20}$/, 'Invalid phone number format')
    .optional()
    .nullable()
    .default(null),
});

export const registerDriverSchema = registerSchema;
export const registerDispatcherSchema = registerSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type CreateFleetManagerInput = z.infer<typeof createFleetManagerSchema>;
export type RegisterDriverInput = z.infer<typeof registerDriverSchema>;
export type RegisterDispatcherInput = z.infer<typeof registerDispatcherSchema>;
