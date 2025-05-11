import { Router } from "express";
import auth from "../../middlewares/Auth";
import { Role } from "@prisma/client";
import inviteController from "./invite.controller";

const route = Router();


route.post("/sent-invite", auth(Role.USER, Role.ADMIN), inviteController.sentInvite )
route.get("/my-all-sent-invites", auth(Role.USER, Role.ADMIN), inviteController.getMyAllSendInvites )
route.get("/", auth(Role.USER, Role.ADMIN), inviteController.getAllInvite )
route.get("/my-all-received-invites", auth(Role.USER, Role.ADMIN), inviteController.getMyAllReceivedInvites )
route.post("/accept-invite/:inviteId", auth(Role.USER, Role.ADMIN), inviteController.acceptInvite )
route.post("/reject-invite/:inviteId", auth(Role.USER, Role.ADMIN), inviteController.rejectInvite )



export const inviteRoute = route;