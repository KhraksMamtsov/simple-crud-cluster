import { badRequest, notFound } from "./response";
import type { DbError } from "../errors";
import type { ValidationError } from "../errors";
import type { ServerResponse } from "http";

type Context = {
  log_prefix: string;
  response: ServerResponse;
};
export const handleError =
  (context: Context) => (error: ValidationError | DbError) => {
    if (error._tag === "DbError") {
      notFound({
        error,
        ...context,
      });
    } else {
      badRequest({
        error,
        ...context,
      });
    }
  };
