import type { VbbMovement } from "./vbb-movement";

export type VbbRadarResponse = {
    readonly movements: readonly VbbMovement[];
}