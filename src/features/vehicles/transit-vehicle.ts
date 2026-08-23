import type { TransitMode } from "./transit-mode";
import type { GeoPosition } from "./geo-position";

export type TransitVehicle = {
    readonly id: string;
    readonly tripId: string;
    readonly lineName: string;
    readonly mode: TransitMode;
    readonly direction: string | null;
    readonly position: GeoPosition | null;
    readonly delaySeconds: number | null;
    readonly updatedAt: Date;
}