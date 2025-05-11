
import { z } from 'zod';

export const creatEventValidation = z.object({
    title: z.string({ required_error: 'title is required' }),
    description: z.string({ required_error: 'description is required' }),
    
    venue: z.string({ required_error: 'venue is required' }),
    type: z.string({ required_error: 'type is required' }),
    isPaid: z.boolean({ required_error: 'isPaid is required' }),
    fee: z.number({ required_error: 'fee is required' }),
    category: z.string({ required_error: 'category is required' }),
    eventStatus: z.string({ required_error: 'eventStatus is required' }),
    startDate: z.string({ required_error: 'startDate is required' }),
    endDate: z.string({ required_error: 'endDate is required' }),
    availableSit: z.number({ required_error: 'availableSites is required' }),
    reseveredSit: z.number({ required_error: 'reseveredSites is required' }),

});
export const updateEventValidation = z.object({
    title: z.string({ required_error: 'title is required' }).optional(),
    description: z.string({ required_error: 'description is required' }).optional(),
   
    venue: z.string({ required_error: 'venue is required' }).optional(),
    type: z.string({ required_error: 'type is required' }).optional(),
    isPaid: z.boolean({ required_error: 'isPaid is required' }).optional(),
    fee: z.number({ required_error: 'fee is required' }).optional(),
    category: z.string({ required_error: 'category is required' }).optional(),
    eventStatus: z.string({ required_error: 'eventStatus is required' }).optional(),
    availableSit: z.number({ required_error: 'availableSites is required' }).optional(),
    reseveredSit: z.number({ required_error: 'reseveredSites is required' }).optional()
});
