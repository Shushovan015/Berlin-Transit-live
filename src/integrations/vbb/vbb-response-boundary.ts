import { vbbRadarResponseSample } from './vbb-radar-response.sample.ts';

export const untrustedVbbResponse: unknown = vbbRadarResponseSample;

export const hasMovementsProperty = (obj: unknown): boolean => {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "movements" in obj
    );
};

export const hasMovementsArray = (obj: unknown): boolean => {
    return (typeof obj === "object" && obj !== null && "movements" in obj && Array.isArray(obj.movements))
}