
import { z } from 'zod';

export const creatEventValidation = z.object({
    title: z.string({ required_error: 'title is required' }),
    description: z.string({ required_error: 'description is required' }),
    dateTime: z.string({ required_error: 'dateTime is required' }),
    venue: z.string({ required_error: 'venue is required' }),
    type: z.string({ required_error: 'type is required' }),
    isPaid: z.boolean({ required_error: 'isPaid is required' }),
    fee: z.number({ required_error: 'fee is required' }),

});
export const updateEventValidation = z.object({
    title: z.string({ required_error: 'title is required' }).optional(),
    description: z.string({ required_error: 'description is required' }).optional(),
    dateTime: z.string({ required_error: 'dateTime is required' }).optional(),
    venue: z.string({ required_error: 'venue is required' }).optional(),
    type: z.string({ required_error: 'type is required' }).optional(),
    isPaid: z.boolean({ required_error: 'isPaid is required' }).optional(),
    fee: z.number({ required_error: 'fee is required' }).optional(),

});
