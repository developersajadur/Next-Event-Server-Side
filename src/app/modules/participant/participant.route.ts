import { Router } from "express";
import auth from "../../middlewares/Auth";
import { Role } from "@prisma/client";
import { participantController } from "./participant.controller";


const route = Router();


route.post("/create-participant", auth(Role.USER), participantController.createParticipant)
route.get("/", auth(Role.USER, Role.ADMIN), participantController.getAllParticipants)
route.get("/event/:eventId", auth(Role.USER, Role.ADMIN), participantController.getAllParticipantsByEventId)
route.patch("/update-participant-status/:participantId/:status", auth(Role.USER, Role.ADMIN), participantController.updateParticipantStatus)


export const participantRoute = route;

// create-participant