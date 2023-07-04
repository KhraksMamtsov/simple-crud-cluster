import * as http from "http";
import { getPort } from "../env";
import { pipe } from "../lib/functions";
import * as O from "../lib/option";
import { start } from "../server/server";

export function startServer(ports: number[]) {
  let currentIndex = 0;
  pipe(
    getPort("PORT"),
    O.map((port) => {
      start({
        port,
        name: "PRIMARY",
        handler: (req, res, LOG_PREFIX) => {
          const { url, method } = req;
          if (url === undefined || method === undefined) {
            return res.end();
          }

          const options = {
            hostname: "localhost",
            port: ports[currentIndex],
            path: url,
            method: method,
            headers: req.headers,
          };

          const request = http.request(options, (response) => {
            console.log(
              LOG_PREFIX,
              "↑",
              options.method,
              options.port,
              options.path
            );
            response.pipe(res.writeHead(response.statusCode!));
          });
          req.pipe(request).on("error", (err) => {
            console.log(LOG_PREFIX + "Error: " + err.message);
          });

          currentIndex = (currentIndex + 1) % ports.length;

          return;
        },
      });
    })
  );
}
