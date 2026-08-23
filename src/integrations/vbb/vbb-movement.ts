import type { VbbLine } from "./vbb-line";
import type { VbbLocation } from "./vbb-location";

export type VbbMovement = {
    readonly tripId: string;
    readonly direction: string | null;
    readonly line: VbbLine;
    readonly location?: VbbLocation | undefined;
}