import { Db } from "./db";
import { start } from "../server/server";

export function startServer(port: number) {
  const db = new Db();

  start({
    port: port,
    name: "DB",
    handler: (req, res, LOG_PREFIX) => {
      req!;
      db!;
      res!;
      LOG_PREFIX;
    },
  });
}
