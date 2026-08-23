import { z } from 'zod';
import { vbbLineSchema } from "./vbb-line.schema"
import { vbbLocationSchema } from './vbb-location.schema';

export const vbbMovementSchema = z.object({
    tripId: z.string().nonempty(),
    direction: z.string().nullable(),
    line: vbbLineSchema,
    location: vbbLocationSchema.optional()
})