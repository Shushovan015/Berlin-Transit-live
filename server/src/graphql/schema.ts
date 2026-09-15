import { createSchema } from "graphql-yoga";

const vehicles = [{
  id: "vehicle-u7-001",
  lineName: "U7",
  mode: "UBAHN",
  position: {
    latitude: 52.4961,
    longitude: 13.3319,
  },
},
{
  id: "vehicle-u8-002",
  lineName: "U8",
  mode: "UBAHN",
  position: null,
}]

type VehicleArgs = {
  readonly id: string;
};

export const schema = createSchema({
  typeDefs: `
    enum TransitMode {
      UBAHN
      SBAHN
    }

    type GeoPosition {
      latitude: Float!
      longitude: Float!
    }

    type TransitVehicle {
      id : ID!
      lineName : String!
      mode : TransitMode!
      position: GeoPosition
    }

    type Query {
      health: String!,
      vehicles: [TransitVehicle!]!
      vehicle(id: ID!): TransitVehicle
    }
  `,

  resolvers: {
    Query: {
      health: () => "ok",
      vehicles: () => vehicles,
      vehicle: (_parent: unknown, args: VehicleArgs) => {
        const vehicle = vehicles.find((vehicle) => {
          return vehicle.id === args.id;
        });
        return vehicle ?? null
      }
    },
  },
});