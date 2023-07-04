import * as v from "../../lib/validator";
import { routeHandler } from "../../server/controller";
import type { User } from "../../user";
import { flow, pipe } from "../../lib/functions";
import * as body from "../../server/body";
import * as T from "../../lib/task";
import * as E from "../../lib/either";
import { ValidationError } from "../../errors";

const createUser = v.shape({
  method: v.string("POST"),
  path: v.tuple([v.string("api"), v.string("users")]),
});
const createUserDtoValidator = v.shape({
  username: v.string(),
  age: v.number(),
  hobbies: v.array(v.string()),
});
export const createUserRoute = routeHandler<User>()(
  createUser,
  ({ request }) =>
    (db) => {
      return pipe(
        request,
        body.validate(createUserDtoValidator),
        T.chain(
          flow(
            E.bimap(
              (body) =>
                ValidationError.of(
                  `Request body ${JSON.stringify(body)} is wrong.`
                ),
              db.create
            ),
            T.sequenceEither
          )
        )
      );
    }
);
