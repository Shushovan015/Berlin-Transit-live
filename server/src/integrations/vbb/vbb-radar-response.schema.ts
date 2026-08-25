import { z } from "zod"

import { vbbMovementSchema } from "./vbb-movement.schema.js"

export const vbbRadarResponseSchema = z.object({
    movements: z.array(vbbMovementSchema)
})