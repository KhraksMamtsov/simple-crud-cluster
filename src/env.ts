import type { Option } from "./lib/option";
import * as O from "./lib/option";
import { pipe } from "./lib/functions";
import { map, reduce } from "./lib/readonlyArray";

export function getPort(key: string): O.Option<number> {
  const port = process.env[key];

  if (port) {
    const portNumber = Number(port);
    if (!Number.isNaN(portNumber)) {
      return O.some(portNumber);
    } else {
      console.log(`PORT=${portNumber} - is not a number!`);
      return O.none;
    }
  } else {
    console.log("Please provide PORT to the process.env!");
    console.log("Use .env or pass it directly!");
    return O.none;
  }
}

export function getPorts<K extends Record<string, string>>(
  ports: K
): O.Option<{
  [_k in keyof K]: number;
}> {
  return pipe(
    Object.entries(ports),
    map(([key, portName]) => [key, getPort(portName)] as const),
    reduce(
      (acc, [key, optionPort]) =>
        pipe(
          acc,
          O.chain((a) =>
            pipe(
              optionPort,
              O.map((port) => {
                a.push([key, port]);
                return a;
              })
            )
          )
        ),
      O.some([]) as Option<[string, number][]>
    ),
    O.map((x) => Object.fromEntries(x))
  ) as any;
}
