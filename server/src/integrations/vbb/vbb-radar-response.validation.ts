import { untrustedVbbResponse } from "./vbb-response-boundary.js";
import { vbbRadarResponseSchema } from "./vbb-radar-response.schema.js";
import { invalidVbbRadarResponse } from "./vbb-radar-response.invalid-sample.js";

export const vbbRadarResponseValidationResult = vbbRadarResponseSchema.safeParse(untrustedVbbResponse)

export const getValidatedMovementCount = (): number | null => {
    if (vbbRadarResponseValidationResult.success) {
        return vbbRadarResponseValidationResult.data.movements.length
    }

    return null
}

export const invalidVbbRadarResponseValidationResult = vbbRadarResponseSchema.safeParse(invalidVbbRadarResponse)

export const getInvalidResponseIssueCount = (): number | null => {
    if (invalidVbbRadarResponseValidationResult.success) {
        return null
    }

    return invalidVbbRadarResponseValidationResult.error.issues.length
}