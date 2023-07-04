export type Option<T> = ReturnType<typeof some<T>> | typeof none;

export const none = { tag: "none" } as const;
export const some = <T>(value: T) => ({ tag: "some", value } as const);
export const match =
  <T, N, S>(onNone: () => N, onSome: (value: T) => S) =>
  (option: Option<T>) =>
    option.tag === "none" ? onNone() : onSome(option.value);

export const map =
  <T, S>(fn: (value: T) => S) =>
  (option: Option<T>): Option<S> =>
    option.tag === "none" ? option : some(fn(option.value));

export const get =
  <N>(onNone: () => N) =>
  <S>(option: Option<S>): S | N =>
    option.tag === "none" ? onNone() : option.value;

export const alt =
  <T1>(fn: () => Option<T1>) =>
  <T>(option: Option<T>): Option<T | T1> =>
    option.tag === "none" ? fn() : option;

export const tap =
  <T>(fn: (value: T) => void) =>
  (option: Option<T>): Option<T> =>
    option.tag === "none" ? option : (fn(option.value), option);

export const chain =
  <T, S>(fn: (value: T) => Option<S>) =>
  (option: Option<T>): Option<S> =>
    option.tag === "none" ? option : fn(option.value);

export const fromUndefinable = <X>(value: X): Option<Exclude<X, undefined>> =>
  value === undefined ? none : some(value as Exclude<X, undefined>);
