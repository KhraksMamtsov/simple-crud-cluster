import * as O from "./option";

export const findFirst =
  <A>(predicate: (el: A) => boolean) =>
  (array: ReadonlyArray<A>) =>
    O.fromUndefinable(array.find(predicate));

export const filter =
  <A>(predicate: (el: A) => boolean) =>
  (array: ReadonlyArray<A>) =>
    array.filter(predicate);

export const map =
  <A, A1>(fn: (el: A) => A1) =>
  (array: ReadonlyArray<A>) =>
    array.map(fn);

export const reduce =
  <A, A1>(fn: (acc: A1, el: A) => A1, acc: A1) =>
  (array: ReadonlyArray<A>) =>
    array.reduce(fn, acc);

export const range = (length: number) =>
  Array.from({ length }).map((_, i) => i);
