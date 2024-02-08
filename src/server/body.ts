import type http from "node:http";
import * as T from "../lib/task";
import type * as v from "../lib/validator";
import { pipe } from "../lib/functions";
import * as json from "../lib/json";

export const body = (request: http.IncomingMessage): T.Task<unknown> => {
  return () => {
    return new Promise((res) => {
      let chunks: Array<Uint8Array> = [];
      request
        .on("error", (err) => {
          throw err;
        })
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => {
          res(Buffer.concat(chunks).toString());
        });
    });
  };
};

export const validate =
  <T>(validator: v.Refinement<unknown, T>) =>
  (request: http.IncomingMessage) =>
    pipe(request, body, T.map(json.validate(validator)));
