import type { ServerResponse } from "http";
import { pipe } from "../lib/functions";
import { stringify } from "../lib/json";
import * as E from "../lib/either";

export const json =
  (args: { response: ServerResponse; log_prefix: string }) =>
  (payload: unknown) => {
    const status = 200;
    const body = JSON.stringify(payload, null, 1);

    args.response
      .writeHead(status, {
        "Content-Type": "application/json",
      })
      .end(body, () => {
        console.log(args.log_prefix, "↑", status, body);
      });
  };

export const badRequest = (args: {
  response: ServerResponse;
  error: Error;
  log_prefix: string;
}) => {
  const status = 400;

  args.response
    .writeHead(status, {
      "Content-Type": "plain/text",
    })
    .end(args.error.message, () => {
      console.log(args.log_prefix, "↑", status, args.error.message);
    });
};

export const notFound = (args: {
  response: ServerResponse;
  error: Error;
  log_prefix: string;
}) => {
  const status = 404;

  args.response
    .writeHead(status, {
      "Content-Type": "plain/text",
    })
    .end(args.error.message, () => {
      console.log(args.log_prefix, "↑", status, args.error.message);
    });
};

export const internalError = (args: {
  response: ServerResponse;
  error: unknown;
  log_prefix: string;
}) => {
  const status = 500;

  let message: string;
  if (args.error instanceof Error) {
    message = args.error.message;
  } else {
    message = pipe(
      args.error,
      stringify,
      E.get(() => "Unknown error.")
    );
  }

  args.response
    .writeHead(status, {
      "Content-Type": "plain/text",
    })
    .end(message, () => {
      console.log(args.log_prefix, "↑", status, message);
    });
};
