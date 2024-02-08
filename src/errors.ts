export class ValidationError extends Error {
  _tag = "ValidationError" as const;

  static of(message: string) {
    return new ValidationError(message);
  }
}

export class DbError extends Error {
  _tag = "DbError" as const;

  static of(uuid: string) {
    return new DbError(`There is no user with id: ${uuid}.`);
  }
}
