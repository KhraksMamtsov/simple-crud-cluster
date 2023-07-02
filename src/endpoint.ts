import { flow, pipe } from "./lib/functions";
import * as E from "./lib/either";
import { DbError, ValidationError } from "./errors";
import * as T from "./lib/task";
import { createRouter, route } from "./server/router";
import * as body from "./server/body";
import * as v from "./lib/validator";

export type EndpointMethod = "GET" | "POST" | "PUT" | "DELETE";

const getAll = v.shape({
  method: v.string("GET"),
  path: v.tuple([v.string("api"), v.string("users")]),
});

const getById = v.shape({
  method: v.string("GET"),
  path: v.tuple([v.string("api"), v.string("users"), v.string()]),
});

const createUser = v.shape({
  method: v.string("POST"),
  path: v.tuple([v.string("api"), v.string("users")]),
});

const updateUser = v.shape({
  method: v.string("PUT"),
  path: v.tuple([v.string("api"), v.string("users"), v.string()]),
});

const deleteUser = v.shape({
  method: v.string("DELETE"),
  path: v.tuple([v.string("api"), v.string("users"), v.string()]),
});

const updateUserDtoValidator = v.partial({
  username: v.string(),
  age: v.number(),
  hobbies: v.array(v.string()),
});

const updateUserRoute = route(updateUser, ({ path, request }) => (db) => {
  return pipe(
    request,
    body.validate(updateUserDtoValidator),
    T.chain(
      flow(
        E.mapLeft((body) =>
          ValidationError.of(`Request body ${JSON.stringify(body)} is wrong.`)
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
});

const deleteRoute = route(deleteUser, (request) => (db) => {
  return pipe(
    request.path[2],
    E.fromPredicate(v.uuid),
    E.bimap(ValidationError.of, (uuid) =>
      pipe(uuid, db.delete, T.map(E.fromOption(() => DbError.of(uuid))))
    ),
    T.sequenceEither,
    T.map(E.flatten)
  );
});

const getAllRoute = route(getAll, () => (db) => {
  return pipe(db.getAll(), T.map(E.right));
});

const getByIdRoute = route(getById, ({ path }) => (db) => {
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
});

const createUserDtoValidator = v.shape({
  username: v.string(),
  age: v.number(),
  hobbies: v.array(v.string()),
});

const createUserRoute = route(createUser, ({ request }) => (db) => {
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
});

export const userController = createRouter([
  getAllRoute,
  getByIdRoute,
  createUserRoute,
  deleteRoute,
  updateUserRoute,
] as any);
