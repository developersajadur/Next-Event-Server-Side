import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
export const createUserZodSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  phoneNumber: z.string({ required_error: 'Phone number is required' }).refine(
    (value) => {
      const phoneNumber = parsePhoneNumberFromString(value, 'BD');
      return phoneNumber?.isValid() ?? false;
    },
    {
      message: 'Invalid phone number format',
    },
  ),
  profileImage: z.string().optional(),
});
