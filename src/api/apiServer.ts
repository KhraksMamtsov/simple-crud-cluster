import { userController } from "../endpoint";
import { getPort } from "../env";
import { pipe } from "../lib/functions";
import * as O from "../lib/option";
import * as E from "../lib/either";
import * as T from "../lib/task";
import * as Server from "../server/server";
import { Db } from "../db/db";
import { badRequest, notFound, ok } from "./response";

export function startServer(args: { dbPort?: number }) {
  const db = args.dbPort ? new Db() : new Db();

  pipe(
    getPort(),
    O.map((port) => {
      Server.start({
        port,
        name: "API",
        handler: (req, res, LOG_PREFIX) => {
          const qwe = pipe(
            userController(req),
            O.match(
              () => {
                notFound({
                  error: new Error(`There is no endpoint ${23}`),
                  log_prefix: LOG_PREFIX,
                  response: res,
                });
              },
              (handler) =>
                pipe(
                  handler(db),
                  T.map(
                    E.match(
                      (error) => {
                        if (error._tag === "DbError") {
                          notFound({
                            error,
                            log_prefix: LOG_PREFIX,
                            response: res,
                          });
                        } else {
                          badRequest({
                            error,
                            log_prefix: LOG_PREFIX,
                            response: res,
                          });
                        }
                      },
                      (user) => {
                        ok({
                          payload: user,
                          log_prefix: LOG_PREFIX,
                          response: res,
                        });
                      }
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

const handleNotFound =
