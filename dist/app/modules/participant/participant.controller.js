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
exports.participantController = void 0;
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const participant_service_1 = require("./participant.service");
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const participant_constants_1 = require("./participant.constants");
const RefineQuery_1 = __importDefault(require("../../helpers/RefineQuery"));
const createParticipant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req);
    const payload = yield req.body;
    const user = yield req.user;
    const dataToSend = {
        eventId: payload.eventId,
        userId: user.id,
        joinedAt: new Date()
    };
    const result = yield participant_service_1.participantService.createParticipant(dataToSend);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Participant created successfully',
        data: result,
    });
}));
const getAllParticipants = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, RefineQuery_1.default)(req.query, participant_constants_1.participantFilterableFields.concat('searchTerm'));
    const options = (0, RefineQuery_1.default)(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder',
    ]);
    const result = yield participant_service_1.participantService.getAllParticipants(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Participants fetched successfully',
        data: {
            data: result.data,
            meta: result.meta,
        },
    });
}));
const getAllParticipantsByEventId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    const result = yield participant_service_1.participantService.getAllParticipantsByEventId(eventId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Participants fetched successfully',
        data: result,
    });
}));
const updateParticipantStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { participantId, status } = req.params;
    const result = yield participant_service_1.participantService.updateParticipantStatus(participantId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Participant status updated successfully',
        data: result,
    });
}));
exports.participantController = {
    createParticipant,
    getAllParticipants,
    getAllParticipantsByEventId,
    updateParticipantStatus,
};
