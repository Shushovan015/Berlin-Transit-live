import type { TransitMode } from "../../features/vehicles/transit-mode.js";
import type { VbbLine } from "./vbb-line.js";
import type { VbbLocation } from "./vbb-location.js";
import type { GeoPosition } from "../../features/vehicles/geo-position.js";
import type { VbbMovement } from "./vbb-movement.js";
import type { TransitVehicle } from "../../features/vehicles/transit-vehicle.js";

export const mapVbbProductToTransitMode = (product: VbbLine['product']): TransitMode => {
    switch (product) {
        case "subway":
            return "UBAHN";

        case "suburban":
            return "SBAHN"
    }
}

export const mapVbbLocationToGeoPosition = (location: VbbLocation | undefined): GeoPosition | null => {
    if (location === undefined) return null
    return {
        latitude: location.latitude,
        longitude: location.longitude
    }
}

export const mapVbbMovementToTransitVehicle = (movement: VbbMovement, updatedAt: Date): TransitVehicle => {
    return {
        id: movement.tripId,
        tripId: movement.tripId,
        lineName: movement.line.name,
        mode: mapVbbProductToTransitMode(movement.line.product),
        direction: movement.direction,
        position: mapVbbLocationToGeoPosition(movement.location),
        delaySeconds: null,
        updatedAt: new Date(updatedAt.getTime()),
    }
}