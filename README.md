# Berlin Transit Live

A real-time web application for visualizing Berlin's U-Bahn and S-Bahn network on an interactive map.

The project consumes live public-transport data from the VBB API, validates every external response with Zod, exposes a type-safe GraphQL API, and streams vehicle updates to a React client. It is designed both as a useful transport visualization and as a practical learning project for production-quality TypeScript.

> Vehicle locations supplied by VBB may be calculated from schedules, route geometry, delays, and live operational reports. The application therefore describes them as **live estimated positions**, not guaranteed raw GPS locations.

## Project goals

- Visualize active Berlin U-Bahn and S-Bahn vehicles on a map.
- Show line, destination, delay, direction, and nearby station information.
- Learn strict TypeScript through real application boundaries.
- Validate untrusted external data at runtime with Zod.
- Build a GraphQL API with queries and subscriptions.
- Deliver live updates using Server-Sent Events.
- Separate external DTOs, domain models, GraphQL types, and UI models.
- Add automated tests, observability, caching, persistence, and CI gradually.

## Planned features

### Core release

- Interactive Berlin map
- Live estimated U-Bahn and S-Bahn vehicle positions
- U-Bahn and S-Bahn filters
- Official-style line colours
- Vehicle detail panel
- Line, direction, destination, delay, and last-update information
- Station search
- Live station departure board
- Service disruption notices
- Connection and data-freshness indicators
- Responsive desktop and mobile layouts

### Later releases

- Smooth animation between position updates
- Historical delay analytics
- Most delayed lines and stations
- Average delay by hour and weekday
- Line-specific performance charts
- Shareable map filters in the URL
- Playback of historical network activity
- Saved stations or lines

## Technology stack

| Area | Technology | Responsibility |
| --- | --- | --- |
| Web application | React, Vite, TypeScript | User interface and feature composition |
| Styling | Tailwind CSS | Responsive design and visual system |
| Map | OpenLayers | Map rendering and geospatial interactions |
| Server state | TanStack Query | Queries, caching, retries, and status handling |
| GraphQL client | `graphql-request` | Lightweight GraphQL requests |
| API | Node.js, GraphQL Yoga | GraphQL schema, resolvers, and subscriptions |
| Real-time transport | GraphQL over SSE, `graphql-sse` | Server-to-client vehicle updates |
| Runtime validation | Zod | Validation of VBB data and configuration |
| Type generation | GraphQL Code Generator | Typed GraphQL operations and documents |
| Database | PostgreSQL, Prisma | Historical snapshots and analytics |
| Cache and messaging | Redis | Latest vehicle state, caching, and Pub/Sub |
| Unit/integration tests | Vitest | Business logic and API tests |
| Component tests | Testing Library | User-facing React behaviour |
| End-to-end tests | Playwright | Browser-level workflows |
| Workspace | pnpm workspaces | Monorepo package management |
| Local infrastructure | Docker Compose | PostgreSQL and Redis development services |

PostgreSQL and Redis are introduced after the first end-to-end feature works. They are not required for the earliest milestone.

## System architecture

```mermaid
flowchart TD
    VBB["VBB transport API"] --> Poller["Polling service"]
    Poller --> Validation["Zod validation"]
    Validation --> Mapper["Domain mapper"]
    Mapper --> Cache["Redis latest state"]
    Mapper --> Database["PostgreSQL history"]
    Cache --> API["GraphQL Yoga API"]
    Database --> API
    API --> Queries["GraphQL queries"]
    API --> Stream["GraphQL subscriptions over SSE"]
    Queries --> Web["React application"]
    Stream --> Web
    Web --> Map["OpenLayers map"]
```

### Data flow

1. The API server requests vehicles in a Berlin bounding box from VBB.
2. The raw JSON is treated as `unknown`.
3. Zod validates the external response.
4. A mapper converts valid VBB DTOs into internal domain models.
5. The latest state is cached and optional snapshots are stored.
6. GraphQL queries return the initial state.
7. GraphQL subscriptions publish changed vehicle positions over SSE.
8. React updates and animates the corresponding OpenLayers features.

The browser never polls VBB directly. One backend polling service controls request frequency, validation, caching, error handling, and distribution to connected clients.

## Repository structure

```text
berlin-transit-live/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── graphql/
│   │   │   │   ├── context.ts
│   │   │   │   ├── schema.ts
│   │   │   │   └── scalars.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/
│   │   │   │   └── redis/
│   │   │   ├── integrations/
│   │   │   │   └── vbb/
│   │   │   │       ├── vbb.client.ts
│   │   │   │       ├── vbb.mapper.ts
│   │   │   │       ├── vbb.schemas.ts
│   │   │   │       └── vbb.types.ts
│   │   │   ├── modules/
│   │   │   │   ├── departures/
│   │   │   │   ├── disruptions/
│   │   │   │   ├── stations/
│   │   │   │   └── vehicles/
│   │   │   └── server.ts
│   │   └── tests/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── features/
│       │   │   ├── departures/
│       │   │   ├── disruptions/
│       │   │   ├── map/
│       │   │   ├── stations/
│       │   │   └── vehicles/
│       │   ├── graphql/
│       │   ├── shared/
│       │   └── main.tsx
│       └── tests/
├── packages/
│   ├── config/
│   ├── domain/
│   ├── test-utils/
│   └── validation/
├── prisma/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

Feature folders should contain the code that changes together. Avoid global folders containing dozens of unrelated hooks, services, or types.

## Data-model boundaries

The project deliberately uses separate models at important boundaries.

### VBB DTO

Represents the validated shape received from the external VBB API. It should remain inside the VBB integration package.

```ts
export type VbbMovementDto = {
  readonly tripId: string;
  readonly direction: string | null;
  readonly line: {
    readonly name: string;
    readonly product: "subway" | "suburban";
  };
};
```

### Domain model

Represents how this application understands a transit vehicle.

```ts
export type TransitMode = "UBAHN" | "SBAHN";

export type GeoPosition = {
  readonly latitude: number;
  readonly longitude: number;
};

export type TransitVehicle = {
  readonly id: string;
  readonly tripId: string;
  readonly lineName: string;
  readonly mode: TransitMode;
  readonly direction: string | null;
  readonly position: GeoPosition | null;
  readonly delaySeconds: number | null;
  readonly updatedAt: Date;
};
```

### GraphQL contract

Defines only the data the application intentionally exposes to clients.

```graphql
enum TransitMode {
  UBAHN
  SBAHN
}

type Position {
  latitude: Float!
  longitude: Float!
}

type Vehicle {
  id: ID!
  tripId: ID!
  lineName: String!
  mode: TransitMode!
  direction: String
  position: Position
  delaySeconds: Int
  updatedAt: DateTime!
}
```

### UI model

Contains display-specific values such as marker colour, formatted delay text, selection status, and animation state. UI formatting must not leak into the domain model.

## Runtime validation with Zod

TypeScript checks code during development, but it cannot prove that network responses match declared types at runtime. All VBB responses must therefore be parsed as `unknown` and validated.

```ts
import { z } from "zod";

const locationSchema = z.object({
  type: z.literal("location"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const movementSchema = z.object({
  tripId: z.string().min(1),
  direction: z.string().nullable(),
  line: z.object({
    id: z.string(),
    name: z.string().min(1),
    product: z.enum(["subway", "suburban"]),
  }),
  location: locationSchema.optional(),
});

export const radarResponseSchema = z.object({
  movements: z.array(movementSchema),
});

export type VbbRadarResponse = z.infer<typeof radarResponseSchema>;
```

```ts
export async function fetchVbbMovements(
  signal?: AbortSignal,
): Promise<VbbRadarResponse> {
  const response = await fetch(buildRadarUrl(), { signal });

  if (!response.ok) {
    throw new VbbHttpError(response.status);
  }

  const input: unknown = await response.json();
  return radarResponseSchema.parse(input);
}
```

Do not replace validation with a type assertion such as:

```ts
const data = (await response.json()) as VbbRadarResponse;
```

That assertion provides no runtime safety.

## GraphQL API

### Initial queries

```graphql
type Query {
  vehicles(filter: VehicleFilter): [Vehicle!]!
  vehicle(id: ID!): Vehicle
  stations(search: String): [Station!]!
  departures(stationId: ID!): [Departure!]!
  disruptions(mode: TransitMode): [Disruption!]!
  networkStats: NetworkStats!
}
```

### Live subscriptions

```graphql
type Subscription {
  vehiclePositions(filter: VehicleFilter): VehiclePositionUpdate!
  departureUpdated(stationId: ID!): Departure!
  disruptionUpdated: Disruption!
}
```

```graphql
subscription LiveVehiclePositions($filter: VehicleFilter) {
  vehiclePositions(filter: $filter) {
    vehicleId
    latitude
    longitude
    delaySeconds
    updatedAt
  }
}
```

Use queries for the initial snapshot and subscriptions for later changes. The subscription payload should contain changes, not resend the entire network after every polling cycle.

## State ownership

| State | Owner |
| --- | --- |
| Initial vehicle and departure data | TanStack Query |
| Live vehicle changes | GraphQL subscription handler |
| Selected vehicle and open panel | React component or feature state |
| Shareable filters | URL search parameters |
| OpenLayers map and feature instances | Map adapter layer |
| Latest server-side vehicle state | In-memory cache, later Redis |
| Historical snapshots | PostgreSQL |

Do not copy server data into global client state without a concrete reason.

## Getting started

### Prerequisites

- Node.js 22 or newer
- pnpm
- Docker Desktop or Docker Engine with Compose
- Git

### Installation

```bash
git clone <your-repository-url>
cd berlin-transit-live
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Expected local services:

| Service | Default URL |
| --- | --- |
| React application | `http://localhost:5173` |
| GraphQL API | `http://localhost:4000/graphql` |
| GraphiQL | `http://localhost:4000/graphql` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

## Environment variables

Create `.env` from `.env.example`:

```dotenv
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:5173

VBB_API_BASE_URL=https://v6.vbb.transport.rest
VBB_POLL_INTERVAL_MS=15000
VBB_REQUEST_TIMEOUT_MS=8000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/berlin_transit
REDIS_URL=redis://localhost:6379

LOG_LEVEL=debug
```

Validate environment variables with Zod when the API process starts. The application should fail immediately with a clear message when required configuration is missing or invalid.

Never commit `.env`, credentials, connection secrets, or production URLs containing tokens.

## Scripts

The root workspace should eventually provide these commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run API and web development servers |
| `pnpm build` | Build all applications and packages |
| `pnpm typecheck` | Type-check the complete workspace |
| `pnpm lint` | Run static analysis |
| `pnpm format` | Format supported files |
| `pnpm test` | Run unit and integration tests |
| `pnpm test:watch` | Run relevant tests in watch mode |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm codegen` | Generate GraphQL TypeScript artifacts |
| `pnpm codegen:check` | Verify generated artifacts are current |
| `pnpm db:generate` | Generate the Prisma client |
| `pnpm db:migrate` | Apply development migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm infra:up` | Start PostgreSQL and Redis |
| `pnpm infra:down` | Stop local infrastructure |

## TypeScript standards

Use strict compiler settings throughout the workspace:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Project rules:

- Do not use `any` in application code.
- Treat external data and caught errors as `unknown`.
- Validate external data before mapping or storing it.
- Prefer discriminated unions for state and result models.
- Add explicit return types to exported functions.
- Allow inference for clear local variables.
- Prefer `readonly` for values that should not be mutated.
- Keep nullable values honest instead of replacing them with empty strings.
- Use exhaustive checks for domain unions.
- Do not manually duplicate generated GraphQL operation types.
- Keep transport, domain, API, and presentation models separate.

Example result union:

```ts
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

## Error handling

Expected error categories include:

- `VbbHttpError`: VBB returned a non-success status.
- `VbbValidationError`: VBB returned an unexpected shape.
- `VbbTimeoutError`: the upstream request exceeded its deadline.
- `DatabaseError`: persistence failed.
- `ConfigurationError`: startup configuration is invalid.

Resolvers should log detailed internal information but return stable, safe GraphQL errors. The web application must show useful loading, stale-data, empty, reconnecting, and unavailable states.

When VBB temporarily fails, keep the last valid snapshot visible and clearly mark it as stale rather than removing every vehicle from the map.

## Polling and real-time behaviour

- Poll VBB from one server-side process every 10 to 20 seconds.
- Keep the polling interval configurable.
- Set an upstream request timeout with `AbortSignal`.
- Prevent overlapping polling cycles.
- Retry temporary failures with bounded exponential backoff and jitter.
- Respect VBB rate limits and caching headers.
- Compare new and previous snapshots by stable vehicle or trip identity.
- Publish only meaningful changes.
- Include `observedAt`, `sourceUpdatedAt`, and freshness information where possible.
- Send a heartbeat so clients can identify interrupted streams.
- Reconnect clients with bounded backoff.

For the first implementation, use an in-process event bus. Introduce Redis Pub/Sub when the API runs across multiple instances.

## GraphQL type safety

GraphQL Code Generator must generate types from both the schema and the operations used by the frontend.

```ts
const VehiclesQuery = graphql(`
  query Vehicles($filter: VehicleFilter) {
    vehicles(filter: $filter) {
      id
      lineName
      mode
      direction
      delaySeconds
      position {
        latitude
        longitude
      }
    }
  }
`);
```

Generated files should not be edited manually. CI should fail if schema or operation changes leave generated artifacts outdated.

## Map implementation guidelines

- Keep OpenLayers objects outside serializable React state.
- Create the map once and dispose it when its owning component unmounts.
- Update existing features rather than recreating the complete vector layer.
- Convert coordinates deliberately and document the projection boundary.
- Use stable vehicle IDs for OpenLayers feature IDs.
- Cluster or simplify markers when zoomed out if performance requires it.
- Animate between the previous and latest valid coordinate.
- Do not imply GPS precision that the upstream data does not provide.
- Provide keyboard-accessible alternatives to map-only information.

## Testing strategy

### Unit tests

- Zod schemas accept valid fixtures.
- Zod schemas reject malformed fixtures.
- VBB DTOs map correctly to domain vehicles.
- Delay and freshness calculations handle boundaries.
- Vehicle-difference logic publishes only real changes.
- Line colour and transport-mode mappings are exhaustive.

### API integration tests

- GraphQL vehicle queries return the expected contract.
- Filters include only requested transport modes and lines.
- Nullable upstream values remain nullable.
- Invalid inputs return stable GraphQL errors.
- Subscriptions receive published vehicle changes.
- Upstream failures return stale cached data where appropriate.

### React component tests

- Loading, empty, error, stale, and success states render correctly.
- Filters update the requested data.
- Selecting a vehicle opens the correct detail panel.
- Subscription updates change the displayed vehicle information.

### End-to-end tests

- The application loads the Berlin map.
- A user filters between U-Bahn and S-Bahn.
- A user selects a vehicle and sees its details.
- A user searches for a station and opens its departures.
- The interface reports a lost and restored live connection.

Tests should use recorded fixtures or mocked boundaries. CI must not depend on the availability or changing output of the live VBB service.

## Development roadmap

### Milestone 1: TypeScript and VBB boundary

- Create the pnpm workspace.
- Enable strict TypeScript settings.
- Add the VBB radar client.
- Validate its response with Zod.
- Map validated DTOs into domain vehicles.
- Add fixture-based unit tests.

**Definition of done:** a tested function returns valid `TransitVehicle[]` values without unsafe assertions.

### Milestone 2: GraphQL query API

- Start GraphQL Yoga.
- Define the vehicle schema and filter input.
- Add vehicle query resolvers.
- Add consistent error mapping.
- Add resolver integration tests.

**Definition of done:** GraphiQL can query validated U-Bahn and S-Bahn vehicles.

### Milestone 3: First map visualization

- Create the React and Tailwind application.
- Add OpenLayers and a Berlin base map.
- Configure GraphQL Code Generator.
- Fetch vehicles using TanStack Query.
- Render mode-specific markers and a detail panel.

**Definition of done:** the complete VBB-to-map-marker data path works.

### Milestone 4: Real-time subscriptions

- Add a controlled server polling loop.
- Keep the latest valid snapshot in memory.
- Detect changed vehicles.
- Publish changes through GraphQL subscriptions over SSE.
- Reconnect the client and animate map updates.

**Definition of done:** marker positions update without refreshing or repeatedly fetching the entire page.

### Milestone 5: Stations and operations

- Add station search.
- Add live departure boards.
- Add disruption information.
- Add stale-data and connection indicators.
- Improve responsive and accessible interaction.

**Definition of done:** users can understand both network movement and station-level service.

### Milestone 6: Persistence and analytics

- Add PostgreSQL and Prisma.
- Store selected historical snapshots.
- Add retention and cleanup rules.
- Create delay summaries and charts.
- Add Redis caching and Pub/Sub when justified.

**Definition of done:** the application can explain recent performance, not only the current snapshot.

### Milestone 7: Production readiness

- Add structured logging and health checks.
- Add Docker images and Compose configuration.
- Add CI for linting, type checking, code generation, tests, and builds.
- Add Playwright smoke tests.
- Document deployment and operational limits.
- Add monitoring for upstream failures and stale data.

**Definition of done:** a new contributor can clone, test, run, and understand the application from this README.

## Performance targets

Initial targets, to be measured rather than assumed:

- Avoid overlapping VBB requests.
- Keep map interaction responsive with the expected Berlin vehicle count.
- Update only changed OpenLayers features.
- Avoid unnecessary React rerenders during position streams.
- Cache station and line metadata longer than live positions.
- Bound database snapshot retention.
- Expose the age of displayed data to the user.

## Accessibility

- Provide a list or table alternative for important map information.
- Ensure vehicle details are keyboard accessible.
- Do not communicate transport mode or delay using colour alone.
- Use sufficient colour contrast.
- Announce connection and critical disruption changes appropriately.
- Respect reduced-motion preferences when animating markers.

## Security and privacy

- Keep secrets on the server.
- Restrict CORS to known web origins in production.
- Validate GraphQL inputs and limit expensive operations.
- Add query depth, complexity, and request-size protections before public deployment.
- Sanitize logged URLs and errors.
- Do not log user location or search history unnecessarily.
- Keep dependencies and container images updated.

## Data source and attribution

Transit information is obtained from VBB-compatible public-transport services. Review and follow the current VBB and upstream data terms before public or commercial deployment.

Map tiles and geographic data require their own attribution. When using OpenStreetMap-based tiles, display the attribution required by the selected tile provider and do not assume the public OpenStreetMap tile servers are suitable for high-volume production traffic.

Useful references:

- [VBB Transport REST API](https://v6.vbb.transport.rest/)
- [GraphQL Yoga subscriptions](https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions)
- [Zod](https://zod.dev/)
- [TanStack Query with GraphQL](https://tanstack.com/query/latest/docs/framework/react/graphql)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen/)
- [OpenLayers](https://openlayers.org/)
- [GTFS Realtime](https://gtfs.org/documentation/realtime/)

## Non-goals for the first release

- User authentication
- Payments or ticket purchasing
- Social features
- Native mobile applications
- Route planning replacement for the official VBB application
- Guaranteed GPS-level vehicle tracking
- Microservices or distributed infrastructure before scale requires them

## Contributing

1. Create a focused branch.
2. Add or update tests with behavioural changes.
3. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
4. Run GraphQL code generation and commit required generated artifacts.
5. Explain the reason for the change and any trade-offs in the pull request.

Prefer small vertical changes that preserve the full path from validated data to user-visible behaviour.

## License

Choose a source-code license before publishing the repository. The project license does not replace or override the attribution and usage requirements of VBB, map tiles, OpenStreetMap data, or other external data providers.

---

This project is intentionally built in stages. The first success criterion is not the number of installed tools. It is one reliable, fully typed path from an untrusted VBB response to a correctly rendered map marker.
