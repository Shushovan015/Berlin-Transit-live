import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";

import { schema } from "./graphql/schema.js";

const yoga = createYoga({ schema });

const server = createServer(yoga);

server.listen(3001, () => {
  console.log("GraphQL server is listening at http://localhost:3001/graphql");
});