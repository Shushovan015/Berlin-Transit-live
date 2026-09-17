import { describe, expect, it } from "vitest";
import { createYoga } from "graphql-yoga";

import { schema } from "./schema.js";

describe("GraphQL schema", () => {
  it("executes the health query", async () => {
    const yoga = createYoga({ schema });

    const response = await yoga.fetch("http://yoga/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{ health }",
      }),
    });

    expect(response.status).toBe(200);

    const body: unknown = await response.json();

    expect(body).toEqual({
      data: {
        health: "ok",
      },
    });
  });
});

describe("existing Vehicles", () => {
  it("executes the vehicle query", async () => {
    const yoga = createYoga({ schema });

    const response = await yoga.fetch("http://yoga/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query Vehicle($id: ID!){
          vehicle(id: $id) {
          id
          lineName
          mode
        }
      }`,
        variables: {
          id: "vehicle-u7-001",
        },
      }),
    });

    expect(response.status).toBe(200);

    const body: unknown = await response.json();

    expect(body).toEqual({
      data: {
        vehicle: {
          id: "vehicle-u7-001",
          lineName: "U7",
          mode: "UBAHN",
        },
      },
    });
  });
});

describe("Vehicles", () => {
  it("executes the vehicle query", async () => {
    const yoga = createYoga({ schema });

    const response = await yoga.fetch("http://yoga/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          vehicles {
          id
          lineName
          mode
          position {
              latitude
              longitude
          }
        }
      }`,
      }),
    });

    expect(response.status).toBe(200);

    const body: unknown = await response.json();

    expect(body).toEqual({
      data: {
        vehicles: [{
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
        }],
      },
    });
  });
});

describe("Missing Vehicles", () => {
  it("executes the missing vehicle query", async () => {
    const yoga = createYoga({ schema });

    const response = await yoga.fetch("http://yoga/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          vehicle(id: "does-not-exist") {
            id
          }
      }`,
      }),
    });

    expect(response.status).toBe(200);

    const body: unknown = await response.json();

    expect(body).toEqual({
      data: {
        vehicle: null,
      },
    });
  });
});

describe("Invalid Vehicles", () => {
  it("returns an error when the required id argument is missing", async () => {
    const yoga = createYoga({ schema });

    const response = await yoga.fetch("http://yoga/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          vehicle {
            id
          }
        }`,
      }),
    });

    expect(response.status).toBe(200);

    const body: unknown = await response.json();

    expect(body).toMatchObject({
      errors: [
        {
          message: expect.stringContaining("Argument"),
        },
      ],
    });
  });
});