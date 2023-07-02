import { userController } from "./controller";
import { getPort } from "../env";
import { flow, pipe } from "../lib/functions";
import * as O from "../lib/option";
import * as E from "../lib/either";
import * as T from "../lib/task";
import * as Server from "../server/server";
import { Db } from "../db/db";
import { notFound, json } from "../server/response";
import { handleError } from "./error";

export function startServer(args?: { port: number }) {
  const db = new Db();

  pipe(
    O.fromUndefinable(args?.port),
    O.alt(() => getPort("PORT")),
    O.map((port) => {
      Server.start({
        port,
        name: "API",
        handler: (req, res, LOG_PREFIX) => {
          pipe(
            userController(req),
            O.match(
              () =>
                notFound({
                  error: new Error(`There is no endpoint ${23}`),
                  log_prefix: LOG_PREFIX,
                  response: res,
                }),
              flow(
                (handler) => handler(db),
                T.map(
                  E.match(
                    handleError({
                      response: res,
                      log_prefix: LOG_PREFIX,
                    }),
                    json({
                      log_prefix: LOG_PREFIX,
                      response: res,
                    })
                  )
                ),
                T.run
              )
            )
          );
        },
      });
    })
  );
}
