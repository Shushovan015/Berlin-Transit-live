import { z } from "zod"

export const vbbLineSchema = z.object({
    id: z.string().nonempty(),
    name: z.string().nonempty(),
    product: z.enum(['subway', 'suburban'])
})