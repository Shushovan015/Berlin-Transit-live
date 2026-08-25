import type { VbbMovement } from "./vbb-movement.js";

export type VbbRadarResponse = {
    readonly movements: readonly VbbMovement[];
}