import { createServer } from "node:http";

const server = createServer((_request, response) => {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ status: "ok" }));
});

server.listen(3001, () => {
    console.log("Server is listening on port 3001")
});