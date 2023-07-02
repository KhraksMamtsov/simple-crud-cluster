import type { User } from "../user";
import type { ServerResponse } from "http";

export const ok =
  (args: { response: ServerResponse; log_prefix: string }) =>
  (payload: User | User[]) => {
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
