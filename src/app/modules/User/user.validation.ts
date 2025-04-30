import { z } from 'zod';

export const createUserZodSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  phoneNumber: z
    .string({ required_error: 'Phone number is required' }),
    // .regex(/^\+8801[3-9]\d{8}$/, 'Invalid Bangladeshi phone number format'),
  profileImage: z.string().url('Invalid URL').optional(),
});


