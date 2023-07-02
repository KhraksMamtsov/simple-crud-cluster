import * as v from "../../lib/validator";
import { routeHandler } from "../../server/controller";
import type { User } from "../../user";
import { flow, pipe } from "../../lib/functions";
import * as body from "../../server/body";
import * as T from "../../lib/task";
import * as E from "../../lib/either";
import { DbError, ValidationError } from "../../errors";

const updateUser = v.shape({
  method: v.string("PUT"),
  path: v.tuple([v.string("api"), v.string("users"), v.string()]),
});
const updateUserDtoValidator = v.partial({
  username: v.string(),
  age: v.number(),
  hobbies: v.array(v.string()),
});
export const updateUserRoute = routeHandler<User>()(
  updateUser,
  ({ path, request }) =>
    (db) => {
      return pipe(
        request,
        body.validate(updateUserDtoValidator),
        T.chain(
          flow(
            E.mapLeft((body) =>
              ValidationError.of(
                `Request body ${JSON.stringify(body)} is wrong.`
              )
            ),
            E.bindTo("body"),
            E.bind("id", () =>
              pipe(
                path[2],
                E.fromPredicate(v.uuid),
                E.mapLeft((id) =>
                  ValidationError.of(`User id "${id}" is not UUID.`)
                )
              )
            ),
            E.map((x) =>
              pipe(
                db.update({
                  id: x.id,
                  ...x.body,
                }),
                T.map(E.fromOption(() => DbError.of(x.id)))
              )
            ),
            T.sequenceEither,
            T.map(E.flatten)
          )
        )
      );
    }
);
