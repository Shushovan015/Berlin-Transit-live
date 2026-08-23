import { mapVbbProductToTransitMode, mapVbbLocationToGeoPosition, mapVbbMovementToTransitVehicle } from "./vbb-movement.mapper";
import type { VbbMovement } from "./vbb-movement";
import { describe, expect, it } from "vitest";

describe("mapVbbProductToTransitMode", () => {
    it('maps "subway" to "UBAHN"', () => {
        const mappedTransitMode = mapVbbProductToTransitMode("subway");
        expect(mappedTransitMode).toBe("UBAHN");
    });
    it('maps "suburban" to "SBAHN"', () => {
        const mappedTransitMode = mapVbbProductToTransitMode("suburban");
        expect(mappedTransitMode).toBe("SBAHN");
    });
});

describe("mapVbbLocationToGeoPosition", () => {
    it("maps an absent location to null", () => {
        const mappedPosition = mapVbbLocationToGeoPosition(undefined)
        expect(mappedPosition).toBeNull()
    })
    it("copies a VBB location into a domain position", () => {
        const vbbLocation = {
            latitude: 52.52,
            longitude: 13.405,
        };
        const mappedPosition = mapVbbLocationToGeoPosition(vbbLocation);
        expect(mappedPosition).toEqual({
            latitude: 52.52,
            longitude: 13.405,
        });
        expect(mappedPosition).not.toBe(vbbLocation);
    })
})

describe("mapVbbMovementToTransitVehicle", () => {
    it("maps a subway movement with a location into a domain vehicle", () => {
        const movement: VbbMovement = {
            tripId: "trip-u7-001",
            direction: "Rudow",
            line: {
                id: "u7",
                name: "U7",
                product: "subway",
            },
            location: {
                latitude: 52.52,
                longitude: 13.405,
            },
        };

        const updatedAt = new Date("2026-08-23T08:00:00.000Z");

        const mappedVehicle = mapVbbMovementToTransitVehicle(
            movement,
            updatedAt,
        );

        expect(mappedVehicle).toEqual({
            id: "trip-u7-001",
            tripId: "trip-u7-001",
            lineName: "U7",
            mode: "UBAHN",
            direction: "Rudow",
            position: {
                latitude: 52.52,
                longitude: 13.405,
            },
            delaySeconds: null,
            updatedAt: new Date("2026-08-23T08:00:00.000Z"),
        });

        expect(mappedVehicle.updatedAt).not.toBe(updatedAt);
    });

    it("maps a suburban movement without a location", () => {
        const movement: VbbMovement = {
            tripId: "trip-s7-002",
            direction: null,
            line: {
                id: "s7",
                name: "S7",
                product: "suburban",
            },
        };

        const updatedAt = new Date("2026-08-23T09:00:00.000Z");

        const mappedVehicle = mapVbbMovementToTransitVehicle(
            movement,
            updatedAt,
        );

        expect(mappedVehicle).toEqual({
            id: "trip-s7-002",
            tripId: "trip-s7-002",
            lineName: "S7",
            mode: "SBAHN",
            direction: null,
            position: null,
            delaySeconds: null,
            updatedAt: new Date("2026-08-23T09:00:00.000Z"),
        });
    });
});
