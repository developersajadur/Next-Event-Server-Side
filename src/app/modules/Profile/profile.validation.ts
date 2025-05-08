import { z } from 'zod';

export const profileValidation = z.object({
  name: z.string({ required_error: 'Name is required' }),
  email: z
    .string({ required_error: 'Email is required' })
   ,
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  address: z.string().optional(),
  bio: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  phoneNumber: z.string({ required_error: 'Phone number is required' }),
  profileImage: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isDeleted: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
});
