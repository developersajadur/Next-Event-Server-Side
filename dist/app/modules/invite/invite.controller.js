"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const invite_service_1 = require("./invite.service");
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const sentInvite = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const payload = req.body;
    const result = yield invite_service_1.InviteService.sentInvite(Object.assign(Object.assign({}, payload), { inviteSenderId: user.id }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Invite sent successfully",
        data: result,
    });
}));
const getMyAllSendInvites = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield invite_service_1.InviteService.getMyAllSendInvites(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All sent invites retrieved successfully",
        data: result,
    });
}));
const getMyAllReceivedInvites = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield invite_service_1.InviteService.getMyAllReceivedInvites(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All received invites retrieved successfully",
        data: result,
    });
}));
const acceptInvite = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { inviteId } = req.params;
    const result = yield invite_service_1.InviteService.acceptInvite(inviteId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Invite accepted successfully",
        data: result,
    });
}));
const getAllInvite = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield invite_service_1.InviteService.getAllInvite();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All Invite Fached successfully",
        data: result,
    });
}));
exports.default = {
    sentInvite,
    getMyAllSendInvites,
    getMyAllReceivedInvites,
    acceptInvite,
    getAllInvite
};
