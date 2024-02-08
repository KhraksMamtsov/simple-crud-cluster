import "dotenv/config";
import s from "supertest";
import { NIL } from "uuid";
import { getPort } from "../src/env";
import { pipe } from "../src/lib/functions";
import * as O from "../src/lib/option";
import * as E from "../src/lib/either";
import * as J from "../src/lib/json";

const port = pipe(
  getPort("TEST_API_PORT"),
  O.alt(() => getPort("PORT")),
  O.get(() => 4000)
);

const apiUrl = `http://localhost:${port}/api`;
const apiUsersUrl = apiUrl + "/users";

function streamParser(
  res: s.Response,
  callback: (err: Error | null, body: any) => void
) {
  res.setEncoding("binary");
  let body = "";
  res.on("data", function (chunk) {
    body += chunk.toString();
  });
  res.on("end", function () {
    callback(
      null,
      pipe(
        J.parseUnknown(body),
        E.get(() => body)
      )
    );
  });
}

describe("Simple CRUD", () => {
  const usersApi = s(apiUsersUrl);
  const testBody = {
    username: "TestUser",
    age: 108,
    hobbies: ["node.js", "typescript"],
  };
  const { hobbies: _hobbies, ...incompleteTestBody } = testBody;

  test("Scenario from assignment", async () => {
    const getAllResponse = await usersApi.get("").parse(streamParser);

    expect(getAllResponse.status).toBe(200);
    expect(getAllResponse.body).toStrictEqual([]);

    const createResponse = await usersApi
      .post("")
      .send(testBody)
      .parse(streamParser);

    expect(createResponse.status).toBe(200);
    expect(createResponse.body).toStrictEqual({
      id: expect.any(String),
      ...testBody,
    });

    const getByIdResponse = await usersApi
      .get("/" + createResponse.body.id)
      .parse(streamParser);

    expect(getByIdResponse.status).toBe(200);
    expect(getByIdResponse.body).toStrictEqual({
      id: createResponse.body.id,
      ...testBody,
    });

    const newTestBody = {
      username: "TestUser_1",
      age: 1008,
      hobbies: ["backend"],
    };

    const updateResponse = await usersApi
      .put("/" + createResponse.body.id)
      .send(newTestBody)
      .parse(streamParser);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toStrictEqual({
      id: createResponse.body.id,
      ...newTestBody,
    });

    const deleteResponse = await usersApi
      .delete("/" + createResponse.body.id)
      .parse(streamParser);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toStrictEqual({
      id: createResponse.body.id,
      ...newTestBody,
    });

    const getByIdAfterDeleteResponse = await usersApi
      .get("/" + createResponse.body.id)
      .parse(streamParser);

    expect(getByIdAfterDeleteResponse.status).toBe(404);
  });

  test("Test 400 errors", async () => {
    const createWithWrongBodyResponse = await usersApi
      .post("")
      .send(incompleteTestBody);

    expect(createWithWrongBodyResponse.status).toBe(400);

    const getByIdResponse = await usersApi.get("/wrong-uuid");

    expect(getByIdResponse.status).toBe(400);

    const createResponse = await usersApi.post("").send(testBody);

    const updateByIdWithWrongBodyResponse = await usersApi
      .put("/" + createResponse.body.id)
      .send(incompleteTestBody);

    expect(updateByIdWithWrongBodyResponse.status).toBe(400);

    const updateByIdWithWrongUUIDResponse = await usersApi
      .put("/wrong-uuid")
      .send(testBody);

    expect(updateByIdWithWrongUUIDResponse.status).toBe(400);
  });

  test("Test 404 errors", async () => {
    const requests = (["post", "get", "delete", "put"] as const).map((method) =>
      s(apiUrl)[method]("/wrong-entity")
    );

    (await Promise.all(requests)).map((x) => expect(x.status).toBe(404));

    const requestsWithWrongId = [
      await usersApi.get("/" + NIL),
      await usersApi.put("/" + NIL).send(testBody),
      await usersApi.delete("/" + NIL),
    ];

    (await Promise.all(requestsWithWrongId)).map((x) =>
      expect(x.status).toBe(404)
    );
  });
});
