import { describe, expect, it } from "vitest";
import { buildVbbRadarUrl } from "./vbb-radar-url";

describe("buildVbbRadarUrl", () => {
    it("constructs the VBB radar URL with the supplied bounds", () => {
        const url = buildVbbRadarUrl({
            north: 52.55,
            west: 13.35,
            south: 52.48,
            east: 13.45,
        })

        expect(url.origin).toBe("https://v6.vbb.transport.rest")
        expect(url.pathname).toBe("/radar")
        expect(url.searchParams.get("north")).toBe("52.55");
        expect(url.searchParams.get("west")).toBe("13.35");
        expect(url.searchParams.get("south")).toBe("52.48");
        expect(url.searchParams.get("east")).toBe("13.45");
        
        expect(url.searchParams.get("results")).toBe("50");
        expect(url.searchParams.get("duration")).toBe("30");
        expect(url.searchParams.get("frames")).toBe("1");
        expect(url.searchParams.get("polylines")).toBe("false");
        expect(url.searchParams.get("pretty")).toBe("false");
    });
});