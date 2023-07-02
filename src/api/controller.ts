import { createController } from "../server/controller";
import type { User } from "../user";
import { getAllRoute } from "./routes/getAll";
import { getByIdRoute } from "./routes/getById";
import { updateUserRoute } from "./routes/update";
import { createUserRoute } from "./routes/create";
import { deleteRoute } from "./routes/delete";

export const userController = createController<User>([
  getAllRoute,
  getByIdRoute,
  createUserRoute,
  deleteRoute,
  updateUserRoute,
] as any);
