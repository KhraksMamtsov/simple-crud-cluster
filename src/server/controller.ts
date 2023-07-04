import type { Db } from "../db/db";
import type * as T from "../lib/task";
import type * as E from "../lib/either";
import type { DbError, ValidationError } from "../errors";
import { pipe } from "../lib/functions";
import type * as v from "../lib/validator";
import * as RA from "../lib/readonlyArray";
import * as O from "../lib/option";
import type http from "node:http";

export type EndpointMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ReqValidator<
  M extends EndpointMethod = EndpointMethod,
  P extends ReadonlyArray<string> = ReadonlyArray<string>
> = v.Refinement<
  {
    method: string;
    path: ReadonlyArray<string>;
  },
  {
    method: M;
    path: P;
  }
>;

export function createController<T>(
  routerScheme: ReadonlyArray<
    readonly [
      ReqValidator,
      (args: {
        path: ReadonlyArray<string>;
        request: http.IncomingMessage;
      }) => (db: Db) => T.Task<E.Either<ValidationError | DbError, T | T[]>>
    ]
  >
) {
  return function match(request: http.IncomingMessage) {
    const [_, ...path] = request.url?.split("/")!;
    const validateShape = {
      method: request.method?.toUpperCase()!,
      path,
    };
    return pipe(
      routerScheme,
      RA.findFirst(([contract]) => contract(validateShape)),
      O.map(([_, handler]) => handler({ path: validateShape.path, request }))
    );
  };
}

export function routeHandler<T>() {
  return function <P extends ReadonlyArray<string>, M extends EndpointMethod>(
    validator: ReqValidator<M, P>,
    handler: (args: {
      request: http.IncomingMessage & { method: M };
      path: P;
    }) => (db: Db) => T.Task<E.Either<ValidationError | DbError, T | T[]>>
  ) {
    return [validator, handler] as const;
  };
}
