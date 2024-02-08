import * as http from "http";
import { getPorts } from "../env";
import { pipe } from "../lib/functions";
import * as O from "../lib/option";
import { start } from "../server/server";

export function startServer() {
  pipe(
    getPorts({
      port: "PORT",
      apiPort: "API_PORT",
    }),
    O.map(({ port, apiPort }) => {
      start({
        port,
        name: "WORKER",
        handler: (req, res, LOG_PREFIX) => {
          const { url, method } = req;
          if (url === undefined || method === undefined) {
            return res.end();
          }

          const options = {
            hostname: "localhost",
            port: apiPort,
            path: url,
            method: method,
            headers: req.headers,
          };

          const requestToApi = http.request(options, (response) => {
            console.log(
              LOG_PREFIX,
              "↑",
              options.method,
              options.port,
              options.path
            );
            response.pipe(res.writeHead(response.statusCode!));
          });

          req.pipe(requestToApi).on("error", (err) => {
            console.log(LOG_PREFIX + "Error: " + err.message);
          });

          return;
        },
      });
    })
  );
}
