"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventValidation = exports.creatEventValidation = void 0;
const zod_1 = require("zod");
exports.creatEventValidation = zod_1.z.object({
    title: zod_1.z.string({ required_error: 'title is required' }),
    description: zod_1.z.string({ required_error: 'description is required' }),
    venue: zod_1.z.string({ required_error: 'venue is required' }),
    type: zod_1.z.string({ required_error: 'type is required' }),
    isPaid: zod_1.z.boolean({ required_error: 'isPaid is required' }),
    fee: zod_1.z.number({ required_error: 'fee is required' }),
    category: zod_1.z.string({ required_error: 'category is required' }),
    eventStatus: zod_1.z.string({ required_error: 'eventStatus is required' }),
    startDate: zod_1.z.string({ required_error: 'startDate is required' }),
    endDate: zod_1.z.string({ required_error: 'endDate is required' }),
    availableSit: zod_1.z.number({ required_error: 'availableSites is required' }),
    reseveredSit: zod_1.z.number({ required_error: 'reseveredSites is required' }),
});
exports.updateEventValidation = zod_1.z.object({
    title: zod_1.z.string({ required_error: 'title is required' }).optional(),
    description: zod_1.z.string({ required_error: 'description is required' }).optional(),
    venue: zod_1.z.string({ required_error: 'venue is required' }).optional(),
    type: zod_1.z.string({ required_error: 'type is required' }).optional(),
    isPaid: zod_1.z.boolean({ required_error: 'isPaid is required' }).optional(),
    fee: zod_1.z.number({ required_error: 'fee is required' }).optional(),
    category: zod_1.z.string({ required_error: 'category is required' }).optional(),
    eventStatus: zod_1.z.string({ required_error: 'eventStatus is required' }).optional(),
    availableSit: zod_1.z.number({ required_error: 'availableSites is required' }).optional(),
    reseveredSit: zod_1.z.number({ required_error: 'reseveredSites is required' }).optional()
});
