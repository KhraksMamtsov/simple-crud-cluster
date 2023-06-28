import * as crypto from "node:crypto";

export interface User {
  readonly id: crypto.UUID;
  readonly username: string;
  readonly age: number;
  readonly hobbies: ReadonlyArray<string>;
}
