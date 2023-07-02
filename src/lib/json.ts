import * as E from "./either";
import * as v from "./validator";
import { pipe } from "./functions";

export const parse = E.tryCatch((x: string) => JSON.parse(x) as unknown);
export const parseUnknown = (x: unknown) =>
  pipe(x, E.fromPredicate(v.string()), E.chain(parse));

export const validate =
  <T>(validator: v.Refinement<unknown, T>) =>
  (x: unknown) =>
    pipe(x, parseUnknown, E.chain(E.fromPredicate(validator)));
