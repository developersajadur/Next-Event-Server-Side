import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const createUserZodSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, 'Name cannot be empty'), 

  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'), // Ensure password length >= 6 characters
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .refine((value) => {
      const phoneNumber = parsePhoneNumberFromString(value, 'BD');
      return phoneNumber?.isValid() ?? false;
    }, {
      message: 'Invalid phone number format',
    }),

  gender: z
    .string({ required_error: 'Gender is required' })
    .refine(val => val === 'Male' || val === 'Female', {
      message: 'Gender must be either Male or Female', // Ensure gender is valid
    }),

  occupation: z
    .string({ required_error: 'Occupation is required' })
    .min(1, 'Occupation cannot be empty'), // Ensure occupation is not empty

  address: z
    .string({ required_error: 'Address is required' })
    .min(1, 'Address cannot be empty'), // Ensure address is not empty

  bio: z
    .string({ required_error: 'Bio is required' })
    .min(1, 'Bio cannot be empty'), // Ensure bio is not empty

  profileImage: z
    .string()
    .optional()
    .nullable(), // Optional profileImage field
});
