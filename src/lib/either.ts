import type { Refinement } from "./validator";
import * as O from "./option";
import { pipe } from "./functions";

export type Either<L, R> =
  | ReturnType<typeof left<L>>
  | ReturnType<typeof right<R>>;

export const left = <L>(left: L) => ({ tag: "left", left } as const);
export const right = <R>(right: R) => ({ tag: "right", right } as const);
export const of = <R>(right: R): Either<never, R> =>
  ({ tag: "right", right } as const);

export const Do = of({});
export const bindTo =
  <const N extends string>(name: N) =>
  <L, R>(either: Either<L, R>): Either<L, { [K in N]: R }> =>
    pipe(
      either,
      map((p) => ({ [name]: p } as any))
    );
export const bind =
  <const N extends string, L, R>(name: N, fn: () => Either<L, R>) =>
  <CL, CR extends {}>(
    context: Either<CL, CR>
  ): Either<L | CL, CR & { [K in N]: R }> => {
    return pipe(
      context,
      chain((cr) =>
        pipe(
          fn(),
          map((r) => ({ ...cr, [name]: r } as any))
        )
      )
    );
  };

export const match =
  <L, R, L1, R1>(onLeft: (left: L) => L1, onRight: (right: R) => R1) =>
  (either: Either<L, R>) =>
    either.tag === "left" ? onLeft(either.left) : onRight(either.right);

export const map =
  <R, R1>(fn: (value: R) => R1) =>
  <L>(either: Either<L, R>): Either<L, R1> =>
    either.tag === "left" ? either : right(fn(either.right));

export const mapLeft =
  <L, L1>(fn: (value: L) => L1) =>
  <R>(either: Either<L, R>): Either<L1, R> =>
    either.tag === "right" ? either : left(fn(either.left));

export const bimap =
  <L, L1, R, R1>(onLeft: (value: L) => L1, onRight: (value: R) => R1) =>
  (either: Either<L, R>): Either<L1, R1> =>
    either.tag === "left"
      ? left(onLeft(either.left))
      : right(onRight(either.right));

export const tap =
  <R>(fn: (value: R) => void) =>
  <L>(either: Either<L, R>): Either<L, R> =>
    either.tag === "left" ? either : (fn(either.right), either);

export const chain =
  <R, L1, R1>(fn: (value: R) => Either<L1, R1>) =>
  <L>(either: Either<L, R>): Either<L | L1, R1> =>
    either.tag === "left" ? either : fn(either.right);

export const flatten = <L, L1, R>(
  either: Either<L, Either<L1, R>>
): Either<L | L1, R> =>
  pipe(
    either,
    chain((x) => x)
  );
export type Compute<A> = { [K in keyof A]: A[K] } & unknown;
export function fromPredicate<T, T1 extends T>(
  refinement: Refinement<T, T1>
): <X extends T>(x: X) => Either<X, Compute<T1>>;
export function fromPredicate<T>(
  refinement: (x: T) => boolean
): (x: T) => Either<T, T>;
export function fromPredicate<T>(
  refinement: (x: T) => boolean
): (x: T) => Either<T, T> {
  return (x) => (refinement(x) ? right(x) : left(x));
}

export const fromOption =
  <L>(onNone: () => L) =>
  <R>(option: O.Option<R>): Either<L, R> =>
    pipe(
      option,
      O.match(() => left(onNone()), right)
    );

export const tryCatch =
  <L, R>(fn: (x: L) => R) =>
  (x: L): Either<L, R> => {
    try {
      return right(fn(x));
    } catch {
      return left(x);
    }
  };
