"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteRoute = void 0;
const express_1 = require("express");
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const client_1 = require("@prisma/client");
const invite_controller_1 = __importDefault(require("./invite.controller"));
const route = (0, express_1.Router)();
route.post("/sent-invite", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), invite_controller_1.default.sentInvite);
route.get("/my-all-sent-invites", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), invite_controller_1.default.getMyAllSendInvites);
route.get("/", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), invite_controller_1.default.getAllInvite);
route.get("/my-all-received-invites", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), invite_controller_1.default.getMyAllReceivedInvites);
route.post("/accept-invite/:inviteId", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), invite_controller_1.default.acceptInvite);
exports.inviteRoute = route;
