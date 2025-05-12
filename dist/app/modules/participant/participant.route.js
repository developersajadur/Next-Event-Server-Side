"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.participantRoute = void 0;
const express_1 = require("express");
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const client_1 = require("@prisma/client");
const participant_controller_1 = require("./participant.controller");
const route = (0, express_1.Router)();
route.post("/create-participant", (0, Auth_1.default)(client_1.Role.USER), participant_controller_1.participantController.createParticipant);
route.get("/", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), participant_controller_1.participantController.getAllParticipants);
route.get("/event/:eventId", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), participant_controller_1.participantController.getAllParticipantsByEventId);
route.patch("/update-participant-status/:participantId/:status", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), participant_controller_1.participantController.updateParticipantStatus);
exports.participantRoute = route;
// create-participant
