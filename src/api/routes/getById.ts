import { routeHandler } from "../../server/controller";
import type { User } from "../../user";
import { pipe } from "../../lib/functions";
import * as E from "../../lib/either";
import * as v from "../../lib/validator";
import { DbError, ValidationError } from "../../errors";
import * as T from "../../lib/task";

const getById = v.shape({
  method: v.string("GET"),
  path: v.tuple([v.string("api"), v.string("users"), v.string()]),
});

export const getByIdRoute = routeHandler<User>()(
  getById,
  ({ path }) =>
    (db) => {
      return pipe(
        path[2],
        E.fromPredicate(v.uuid),
        E.bimap(
          (id) => ValidationError.of(`User id "${id}" is not UUID.`),
          (uuid) =>
            pipe(uuid, db.getById, T.map(E.fromOption(() => DbError.of(uuid))))
        ),
        T.sequenceEither,
        T.map(E.flatten)
      );
    }
);
