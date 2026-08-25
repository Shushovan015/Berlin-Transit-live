import { z } from 'zod';
import { vbbLineSchema } from "./vbb-line.schema.js"
import { vbbLocationSchema } from './vbb-location.schema.js';

export const vbbMovementSchema = z.object({
    tripId: z.string().nonempty(),
    direction: z.string().nullable(),
    line: vbbLineSchema,
    location: vbbLocationSchema.optional()
})