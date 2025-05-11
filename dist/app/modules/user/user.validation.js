"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserZodSchema = void 0;
const zod_1 = require("zod");
const libphonenumber_js_1 = require("libphonenumber-js");
exports.createUserZodSchema = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: 'Name is required' })
        .min(1, 'Name cannot be empty'),
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format'),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters long'), // Ensure password length >= 6 characters
    phoneNumber: zod_1.z
        .string({ required_error: 'Phone number is required' })
        .refine((value) => {
        var _a;
        const phoneNumber = (0, libphonenumber_js_1.parsePhoneNumberFromString)(value, 'BD');
        return (_a = phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.isValid()) !== null && _a !== void 0 ? _a : false;
    }, {
        message: 'Invalid phone number format',
    }),
    gender: zod_1.z
        .string({ required_error: 'Gender is required' })
        .refine(val => val === 'Male' || val === 'Female', {
        message: 'Gender must be either Male or Female', // Ensure gender is valid
    }),
    occupation: zod_1.z
        .string({ required_error: 'Occupation is required' })
        .min(1, 'Occupation cannot be empty'), // Ensure occupation is not empty
    address: zod_1.z
        .string({ required_error: 'Address is required' })
        .min(1, 'Address cannot be empty'), // Ensure address is not empty
    bio: zod_1.z
        .string({ required_error: 'Bio is required' })
        .min(1, 'Bio cannot be empty'), // Ensure bio is not empty
    profileImage: zod_1.z
        .string()
        .optional()
        .nullable(), // Optional profileImage field
});
