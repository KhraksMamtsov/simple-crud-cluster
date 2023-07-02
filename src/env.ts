import * as O from "./lib/option";

export function getPort(): O.Option<number> {
  const port = process.env["PORT"];

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
