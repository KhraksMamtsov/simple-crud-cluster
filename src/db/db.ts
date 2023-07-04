import type { User } from "../user";
import * as crypto from "node:crypto";
import * as O from "../lib/option";
import * as T from "../lib/task";
import { pipe } from "../lib/functions";

export class Db {
  private _users = new Map<crypto.UUID, User>();

  getAll = () => T.of([...this._users.values()]);
  getById = (id: crypto.UUID) => T.of(O.fromUndefinable(this._users.get(id)));

  create = (create: Omit<User, "id">) =>
    T.fromIO(() => {
      const newUser = {
        id: crypto.randomUUID(),
        ...create,
      };

      this._users.set(newUser.id, newUser);
      return newUser;
    });

  update = (partialUser: Pick<User, "id"> & Partial<Omit<User, "id">>) =>
    pipe(
      partialUser.id,
      this.getById,
      T.map(O.map((x) => Object.assign({}, x, partialUser) as User)),
      T.map(O.tap((x) => this._users.set(x.id, x)))
    );

  delete = (id: crypto.UUID) =>
    pipe(
      //
      this.getById(id),
      T.map(O.tap((u) => this._users.delete(u.id)))
    );
}
