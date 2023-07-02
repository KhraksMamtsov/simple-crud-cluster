import * as v from "../../lib/validator";
import { routeHandler } from "../../server/controller";
import type { User } from "../../user";
import { pipe } from "../../lib/functions";
import * as E from "../../lib/either";
import { DbError, ValidationError } from "../../errors";
import * as T from "../../lib/task";

const deleteUser = v.shape({
  method: v.string("DELETE"),
  path: v.tuple([v.string("api"), v.string("users"), v.string()]),
});
export const deleteRoute = routeHandler<User>()(
  deleteUser,
  (request) => (db) => {
    return pipe(
      request.path[2],
      E.fromPredicate(v.uuid),
      E.bimap(ValidationError.of, (uuid) =>
        pipe(uuid, db.delete, T.map(E.fromOption(() => DbError.of(uuid))))
      ),
      T.sequenceEither,
      T.map(E.flatten)
    );
  }
);
