import type { VbbRadarBounds } from "./vbb-radar-bounds";
import { buildVbbRadarUrl } from "./vbb-radar-url";
import { VbbHttpError } from "./vbb-http-error";
import type { TransitVehicle } from "../../features/vehicles/transit-vehicle";
import { vbbRadarResponseSchema } from "./vbb-radar-response.schema";
import { mapVbbMovementToTransitVehicle } from "./vbb-movement.mapper";

export async function fetchVbbRadarInput(bounds: VbbRadarBounds, signal?: AbortSignal): Promise<unknown> {
    const url = buildVbbRadarUrl(bounds);
    const requestOptions: RequestInit | undefined = signal === undefined ? undefined : { signal }

    const response = await fetch(url, requestOptions)

    if (!response.ok) {
        throw new VbbHttpError(response.status, response.statusText)
    }

    const input: unknown = await response.json()

    return input
}

export async function fetchVbbVehicles(bounds: VbbRadarBounds, updatedAt: Date, signal?: AbortSignal): Promise<readonly TransitVehicle[]> {
    const input: unknown = await fetchVbbRadarInput(bounds, signal);
    const validatedResponse = vbbRadarResponseSchema.parse(input);

    const vehicles = validatedResponse.movements.map((movement) =>
        mapVbbMovementToTransitVehicle(movement, updatedAt),
    );

    return vehicles;
}