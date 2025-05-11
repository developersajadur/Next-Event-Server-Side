"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileValidation = exports.profileValidation = void 0;
const zod_1 = require("zod");
exports.profileValidation = zod_1.z.object({
    name: zod_1.z.string({ required_error: 'Name is required' }),
    email: zod_1.z
        .string({ required_error: 'Email is required' }),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters long'),
    address: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    gender: zod_1.z.string().optional(),
    occupation: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string({ required_error: 'Phone number is required' }),
    profileImage: zod_1.z.string().optional(),
    role: zod_1.z.enum(['USER', 'ADMIN']).optional(),
    isDeleted: zod_1.z.boolean().optional(),
    isBlocked: zod_1.z.boolean().optional(),
});
// Zod update Validation Schema
exports.UpdateProfileValidation = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email format"),
    profileImage: zod_1.z.string().url("Invalid URL for profile image"),
    phoneNumber: zod_1.z.string().min(10, "Phone number should be at least 10 characters"),
    address: zod_1.z.string().min(1, "Address is required"),
    occupation: zod_1.z.string().min(1, "Occupation is required"),
});
