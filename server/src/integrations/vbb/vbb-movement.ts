import type { VbbLine } from "./vbb-line.js";
import type { VbbLocation } from "./vbb-location.js";

export type VbbMovement = {
    readonly tripId: string;
    readonly direction: string | null;
    readonly line: VbbLine;
    readonly location?: VbbLocation | undefined;
}