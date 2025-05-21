import { Router } from "express";
import auth from "../../middlewares/Auth";
import { Role } from "@prisma/client";
import { metaController } from "./meta.controller";

const route = Router();


route.get("/all-meta-data", auth(Role.ADMIN), metaController.getMetaData )




export const metaRoute = route;