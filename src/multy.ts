import cluster from "node:cluster";
import * as API from "./api/apiServer";
import * as PRIMARY from "./multy/primaryServer";
import * as WORKER from "./multy/workerServer";
import { getPort } from "./env";
import os from "node:os";
import { pipe } from "./lib/functions";
import * as RA from "./lib/readonlyArray";
import * as O from "./lib/option";
import * as T from "./lib/task";

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
          RA.map((port) => () => {
            return new Promise<number>((resolve) => {
              const worker = cluster.fork({ PORT: port, API_PORT: apiPort });

              worker.on("listening", () => {
                resolve(port);
              });
            });
          })
        );

        return pipe(
          T.sequenceArray(ports),
          T.bindTo("ports"),
          T.bind("api", () =>
            T.fromIO(() => API.startServer({ port: apiPort }))
          ),
          T.chain((context) =>
            T.fromIO(() => PRIMARY.startServer(context.ports))
          )
        );
      } else {
        return T.fromIO(() => WORKER.startServer());
      }
    })
  );

pipe(
  //
  multy(),
  O.map(T.run),
  O.get(T.of(undefined as void))
);
