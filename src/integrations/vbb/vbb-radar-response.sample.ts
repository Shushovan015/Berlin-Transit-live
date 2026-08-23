import type { VbbRadarResponse } from './vbb-radar-response';

export const vbbRadarResponseSample: VbbRadarResponse = {
    movements: [
        {
            tripId: "trip-123",
            direction: "North",
            line: {
                id: "line-456",
                name: "U7",
                product: "subway"
            },
            location: {
                latitude: 52.5200,
                longitude: 13.4050
            }
        },
        {
            tripId: "trip-1234",
            direction: null,
            line: {
                id: "line-4567",
                name: "S7",
                product: "suburban"
            },
            
        }
    ]
};