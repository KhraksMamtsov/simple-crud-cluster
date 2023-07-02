import cluster from "node:cluster";
import * as API from "./api/apiServer";
import * as PRIMARY from "./multy/primaryServer";
import * as WORKER from "./multy/workerServer";
import { getPort } from "./env";
import os from "node:os";
import { pipe } from "./lib/functions";
import * as RA from "./lib/readonlyArray";
import * as O from "./lib/option";

const multy = () =>
  pipe(
    getPort("PORT"),
    O.map((portNumber) => {
      const availableParallelism = os.availableParallelism();
      const apiPort = portNumber + availableParallelism + 1;

      if (cluster.isPrimary) {
        const ports = pipe(
          RA.range(availableParallelism),
          RA.map((x) => portNumber + x + 1),
          RA.map((port) => {
            cluster.fork({ PORT: port, API_PORT: apiPort });
            return port;
          })
        );

        API.startServer({ port: apiPort });
        PRIMARY.startServer(ports);
      } else {
        WORKER.startServer();
      }
    })
  );

multy();
