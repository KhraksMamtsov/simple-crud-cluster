import { User } from "./user";
import * as crypto from "node:crypto";
import * as O from "./option";
import { pipe } from "./functions";

export class Db {
  private _users = new Map<crypto.UUID, User>();

  getAll() {
    return this._users;
  }

  getById(id: crypto.UUID) {
    return O.fromUndefinable(this._users.get(id));
  }

  create(create: Omit<User, "id">) {
    const newUser = {
      id: crypto.randomUUID(),
      ...create,
    };

    this._users.set(newUser.id, newUser);

    return newUser;
  }

  update(partialUser: Pick<User, "id"> & Partial<Omit<User, "id">>) {
    return pipe(
      partialUser.id,
      this.getById,
      O.map((x) => Object.assign({}, x, partialUser)),
      O.tap((x) => this._users.set(x.id, x))
    );
  }

  delete(id: crypto.UUID) {
    return pipe(
      this.getById(id),
      O.tap((u) => this._users.delete(u.id))
    );
  }
}
