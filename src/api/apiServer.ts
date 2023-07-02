import { userController } from "../endpoint";
import { getPort } from "../env";
import { flow, pipe } from "../lib/functions";
import * as O from "../lib/option";
import * as E from "../lib/either";
import * as T from "../lib/task";
import * as Server from "../server/server";
import { Db } from "../db/db";
import { notFound, ok } from "./response";
import { handleError } from "./error";

export function startServer(args: { dbPort?: number }) {
  const db = args.dbPort ? new Db() : new Db();

  pipe(
    getPort(),
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
                    ok({
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
