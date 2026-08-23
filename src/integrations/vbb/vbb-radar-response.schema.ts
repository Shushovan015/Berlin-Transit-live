import { z } from "zod"

import { vbbMovementSchema } from "./vbb-movement.schema"

export const vbbRadarResponseSchema = z.object({
    movements: z.array(vbbMovementSchema)
})