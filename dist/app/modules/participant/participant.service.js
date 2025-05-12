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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.participantService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const CalculatePagination_1 = __importDefault(require("../../helpers/CalculatePagination"));
const createParticipant = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistEvent = yield prisma_1.default.event.findUnique({
        where: {
            id: payload.eventId,
        },
    });
    if (!isExistEvent || isExistEvent.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    if (isExistEvent.isPaid) {
        // console.log(payload.userId, payload.eventId);
        const isExistPayment = yield prisma_1.default.payment.findFirst({
            where: {
                userId: payload.userId,
                eventId: payload.eventId,
            },
        });
        // console.log(isExistPayment);
        if (!isExistPayment) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment not found! Please pay first');
        }
    }
    const isAlreadyParticipated = yield prisma_1.default.participant.findFirst({
        where: {
            userId: payload.userId,
            eventId: payload.eventId,
            isDeleted: false,
        },
    });
    if (isAlreadyParticipated) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have already participated in this event');
    }
    const result = yield prisma_1.default.participant.create({
        data: payload,
    });
    // console.log(result, "fdfddfd");
    return result;
});
const getAllParticipants = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = query, filters = __rest(query, ["searchTerm"]);
    const { page, limit, skip, sortBy, sortOrder } = (0, CalculatePagination_1.default)(options);
    const where = Object.assign(Object.assign({ isDeleted: false }, (searchTerm && {
        OR: [
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
            {
                user: { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
            },
            { event: { title: { contains: searchTerm, mode: 'insensitive' } } },
            { event: { venue: { contains: searchTerm, mode: 'insensitive' } } },
        ],
    })), (Object.keys(filters).length > 0 && {
        AND: Object.entries(filters).map(([key, value]) => ({
            [key]: typeof value === 'string' && (value === 'true' || value === 'false')
                ? value === 'true'
                : value,
        })),
    }));
    const result = yield prisma_1.default.participant.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            event: {
                select: {
                    id: true,
                    title: true,
                    bannerImage: true,
                    fee: true,
                    isPaid: true,
                    type: true,
                    venue: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.participant.count({ where });
    return {
        meta: { page, limit, total },
        data: result,
    };
});
const getAllParticipantsByEventId = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.participant.findMany({
        where: {
            eventId,
            isDeleted: false,
        },
        include: {
            event: {
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    bannerImage: true,
                    fee: true,
                    isPaid: true,
                    type: true,
                    venue: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true,
                },
            },
        },
    });
    return result;
});
const updateParticipantStatus = (participantId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistParticipant = yield prisma_1.default.participant.findUnique({
        where: {
            id: participantId,
            isDeleted: false,
        },
    });
    if (!isExistParticipant) {
        throw new AppError_1.default(404, 'Participant not found');
    }
    const result = yield prisma_1.default.participant.update({
        where: {
            id: participantId,
        },
        data: {
            status,
        },
    });
    return result;
});
exports.participantService = {
    createParticipant,
    getAllParticipants,
    getAllParticipantsByEventId,
    updateParticipantStatus,
};
