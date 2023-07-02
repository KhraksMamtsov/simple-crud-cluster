import cluster from "node:cluster";
import * as API from "./api/apiServer";
import * as PRIMARY from "./primaryServer";
import * as DB from "./db/dbServer";
import { getPort } from "./env";
import os from "node:os";
import { pipe } from "./lib/functions";
import * as RA from "./lib/readonlyArray";
import * as O from "./lib/option";

export const bootstrap = () =>
  pipe(
    getPort(),
    O.map((portNumber) => {
      const availableParallelism = os.availableParallelism();
      const dbPort = portNumber + availableParallelism + 2;

      if (cluster.isPrimary) {
        const ports = pipe(
          RA.range(availableParallelism),
          RA.map((x) => portNumber + x + 1),
          RA.map((port) => {
            cluster.fork({ PORT: port });
            return port;
          })
        );

        PRIMARY.startServer(ports);
        DB.startServer(dbPort);
      } else {
        API.startServer({ dbPort });
      }
    })
  );
