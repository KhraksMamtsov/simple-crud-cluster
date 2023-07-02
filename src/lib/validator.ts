import type * as crypto from "node:crypto";
import { parse } from "uuid";
import { pipe } from "./functions";

export type Refinement<A, R extends A> = (x: A) => x is R;

export const string =
  <S extends string>(literal?: S) =>
  (x: unknown): x is typeof literal extends undefined ? string : S => {
    if (typeof x === "string") {
      if (literal === undefined) {
        return true;
      } else {
        return x === literal;
      }
    } else {
      return false;
    }
  };

export const number =
  <S extends number>(literal?: S) =>
  (x: unknown): x is typeof literal extends undefined ? number : S => {
    if (typeof x === "number") {
      if (literal === undefined) {
        return true;
      } else {
        return x === literal;
      }
    } else {
      return false;
    }
  };

export const unknown = (_: unknown): _ is unknown => true;

export const array =
  <A, R extends A>(el: Refinement<A, R>) =>
  (x: unknown): x is ReadonlyArray<R> =>
    Array.isArray(x) ? x.every(el) : false;

export const and =
  <A, C extends A>(ac: Refinement<A, C>) =>
  <B extends A>(ab: Refinement<A, B>) =>
  (x: A): x is B & C =>
    ab(x) && ac(x);

export const then =
  <A, B extends A, C extends B>(bc: Refinement<B, C>) =>
  (ab: Refinement<A, B>) =>
  (x: A): x is C =>
    ab(x) ? bc(x) : false;

export const uuid = pipe(
  string(),
  then((x): x is crypto.UUID => {
    try {
      parse(x);
      return true;
    } catch {
      return false;
    }
  })
);

type ShapeRefinement<
  O extends Readonly<Record<string, Refinement<unknown, unknown>>>
> = {
  readonly [K in keyof O]: O[K] extends Refinement<unknown, infer T>
    ? T
    : never;
};

export const shape =
  <const O extends Readonly<Record<string, Refinement<unknown, unknown>>>>(
    properties: O
  ) =>
  (x: unknown): x is ShapeRefinement<O> => {
    if (x === null || x === undefined) return false;

    const xLength = Object.entries(x).length;
    const p = Object.entries(properties);

    return xLength === p.length && p.every(([k, v]) => v((x as any)[k]));
  };

type TupleRefinement<O extends ReadonlyArray<Refinement<unknown, unknown>>> =
  Readonly<{
    [K in keyof O]: O[K] extends Refinement<unknown, infer T> ? T : never;
  }>;

export const tuple =
  <const T extends ReadonlyArray<Refinement<unknown, unknown>>>(tuple: T) =>
  (x: unknown): x is TupleRefinement<T> =>
    Array.isArray(x)
      ? x.length === tuple.length && tuple.every((v, i) => v(x[i]))
      : false;

export const partial =
  <const P extends Readonly<Record<string, Refinement<unknown, unknown>>>>(
    properties: P
  ) =>
  (x: unknown): x is Partial<ShapeRefinement<P>> => {
    if (x === null || x === undefined) return false;
    return Object.entries(x).every(([k, v]) => {
      const validator = properties[k];
      return validator ? validator(v) : false;
    });
  };

export type Infer<X extends Refinement<unknown, unknown>> =
  X extends Refinement<unknown, infer T> ? T : never;

const _for =
  <I extends Object>() =>
  <
    P extends {
      [K in keyof I]: Refinement<unknown, I[K]>;
    }
  >(
    properties: P
  ) =>
  (x: unknown): x is I =>
    shape(properties)(x);

export { _for as for };
