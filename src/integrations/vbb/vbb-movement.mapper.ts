import type { TransitMode } from "../../features/vehicles/transit-mode";
import type { VbbLine } from "./vbb-line";
import type { VbbLocation } from "./vbb-location";
import type { GeoPosition } from "../../features/vehicles/geo-position";
import type { VbbMovement } from "./vbb-movement";
import type { TransitVehicle } from "../../features/vehicles/transit-vehicle";

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