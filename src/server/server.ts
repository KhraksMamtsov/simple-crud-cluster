import http from "node:http";
import cluster from "node:cluster";
import { internalError } from "./response";

export function start(args: {
  port: number;
  name: string;
  handler: (
    req: http.IncomingMessage,
    res: http.ServerResponse & { req: http.IncomingMessage },
    prefix: string
  ) => void;
}) {
  const PREFIX = `${args.name}:${args.port}:${process.pid} `;
  const server = http
    .createServer((req, res) => {
      console.log(PREFIX, "↓", req.method, req.url);
      try {
        args.handler(req, res, PREFIX);
      } catch (error) {
        internalError({
          error,
          log_prefix: PREFIX,
          response: res,
        });
      }
    })
    .listen(args.port, () => {
      console.log(PREFIX + `http://localhost:` + args.port);
    });

  cluster.on("exit", (_, code, signal) => {
    console.log(PREFIX + `${code} ${signal} died`);
  });

  process
    .on("uncaughtException", () => {})
    .on("exit", () => {
      console.log(PREFIX + `,`);
      server.close(() => {
        process.exit();
      });
    })
    .on("SIGINT", () => {
      console.log(PREFIX + `SIGINT`);
      server.close(() => {
        process.exit();
      });
    });
}
