import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchVbbRadarInput, fetchVbbVehicles } from "./vbb-radar.client";
import { VbbHttpError } from "./vbb-http-error";
import { ZodError } from "zod";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("fetchVbbRadarInput", () => {

    it("returns the JSON body from a successful response", async () => {
        const responseBody = {
            movements: [],
        };

        const response = new Response(JSON.stringify(responseBody), {
            status: 200,
            statusText: "OK",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const fetchMock = vi.fn().mockResolvedValue(response);
        vi.stubGlobal("fetch", fetchMock);

        const result = await fetchVbbRadarInput({
            north: 52.55,
            west: 13.35,
            south: 52.48,
            east: 13.45,
        });

        expect(result).toEqual(responseBody);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("throws VbbHttpError for a non-success response", async () => {
        const response = new Response(null, {
            status: 503,
            statusText: "Service Unavailable",
        });

        const fetchMock = vi.fn().mockResolvedValue(response);
        vi.stubGlobal("fetch", fetchMock);

        const request = fetchVbbRadarInput({
            north: 52.55,
            west: 13.35,
            south: 52.48,
            east: 13.45,
        });

        await expect(request).rejects.toBeInstanceOf(VbbHttpError);
        await expect(request).rejects.toMatchObject({
            name: "VbbHttpError",
            status: 503,
            statusText: "Service Unavailable",
        });
    });

    it("forwards an abort signal to fetch", async () => {
        const controller = new AbortController();
        const responseBody = {};

        const response = new Response(JSON.stringify(responseBody), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const fetchMock = vi.fn().mockResolvedValue(response);
        vi.stubGlobal("fetch", fetchMock);

        await fetchVbbRadarInput(
            {
                north: 52.55,
                west: 13.35,
                south: 52.48,
                east: 13.45,
            },
            controller.signal,
        );

        expect(fetchMock).toHaveBeenCalledWith(expect.any(URL), {
            signal: controller.signal,
        });
    });
});

describe("fetchVbbVehicles", () => {
    it("validates and maps a successful radar response", async () => {
        const responseBody = {
            movements: [
                {
                    tripId: "trip-u8-001",
                    direction: "Wittenau",
                    line: {
                        id: "u8",
                        name: "U8",
                        product: "subway",
                    },
                    location: {
                        latitude: 52.52,
                        longitude: 13.4,
                    },
                },
            ],
        };

        const response = new Response(JSON.stringify(responseBody), {
            status: 200,
            statusText: "OK",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const fetchMock = vi.fn().mockResolvedValue(response);
        vi.stubGlobal("fetch", fetchMock);

        const updatedAt = new Date("2026-08-23T12:00:00.000Z");

        const vehicles = await fetchVbbVehicles(
            {
                north: 52.55,
                west: 13.35,
                south: 52.48,
                east: 13.45,
            },
            updatedAt,
        );

        expect(vehicles).toEqual([
            {
                id: "trip-u8-001",
                tripId: "trip-u8-001",
                lineName: "U8",
                mode: "UBAHN",
                direction: "Wittenau",
                position: {
                    latitude: 52.52,
                    longitude: 13.4,
                },
                delaySeconds: null,
                updatedAt,
            },
        ]);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    it("rejects invalid radar data", async () => {
        const responseBody = {
            movements: "not-an-array",
        };

        const response = new Response(JSON.stringify(responseBody), {
            status: 200,
            statusText: "OK",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const fetchMock = vi.fn().mockResolvedValue(response);
        vi.stubGlobal("fetch", fetchMock);

        const updatedAt = new Date("2026-08-23T12:00:00.000Z");

        const request = fetchVbbVehicles(
            {
                north: 52.55,
                west: 13.35,
                south: 52.48,
                east: 13.45,
            },
            updatedAt,
        );

        await expect(request).rejects.toBeInstanceOf(ZodError);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});