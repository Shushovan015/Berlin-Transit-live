import type { VbbRadarBounds } from "./vbb-radar-bounds"

export function buildVbbRadarUrl(bounds: VbbRadarBounds): URL {
    const url = new URL("https://v6.vbb.transport.rest/radar");

    url.searchParams.set("north", String(bounds.north));
    url.searchParams.set("west", String(bounds.west));
    url.searchParams.set("south", String(bounds.south));
    url.searchParams.set("east", String(bounds.east));

    url.searchParams.set("results", "50");
    url.searchParams.set("duration", "30");
    url.searchParams.set("frames", "1");
    url.searchParams.set("polylines", "false");
    url.searchParams.set("pretty", "false");

    return url;
}