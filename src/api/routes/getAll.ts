import * as v from "../../lib/validator";
import { routeHandler } from "../../server/controller";
import type { User } from "../../user";
import { pipe } from "../../lib/functions";
import * as T from "../../lib/task";
import * as E from "../../lib/either";

const getAll = v.shape({
  method: v.string("GET"),
  path: v.tuple([v.string("api"), v.string("users")]),
});
export const getAllRoute = routeHandler<User>()(getAll, () => (db) => {
  return pipe(db.getAll(), T.map(E.right));
});
