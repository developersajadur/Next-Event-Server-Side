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
exports.InviteService = void 0;
const participant_service_1 = require("./../participant/participant.service");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const emailHelper_1 = require("../../helpers/emailHelper");
const config_1 = __importDefault(require("../../config"));
const sentInvite = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { inviteReceiverId, eventId, inviteSenderId } = payload;
    const inviteReceiver = yield prisma_1.default.user.findUnique({
        where: { id: inviteReceiverId },
    });
    if (!inviteReceiver ||
        inviteReceiver.isDeleted ||
        inviteReceiver.isBlocked) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Invite receiver does not exist or is inactive");
    }
    const event = yield prisma_1.default.event.findUnique({
        where: { id: eventId },
    });
    if (!event || event.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Event does not exist");
    }
    const sender = yield prisma_1.default.user.findUnique({
        where: { id: inviteSenderId },
    });
    if (!sender || sender.isDeleted || sender.isBlocked) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Inviter does not exist or is inactive");
    }
    const existingInvite = yield prisma_1.default.invite.findFirst({
        where: {
            eventId,
            inviteReceiverId,
            isDeleted: false,
        },
    });
    if (existingInvite) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User has already been invited to this event");
    }
    const invite = yield prisma_1.default.invite.create({
        data: payload
    });
    const html = yield emailHelper_1.EmailHelper.createEmailContent({
        name: inviteReceiver.name,
        senderName: sender.name,
        eventTitle: event.title,
        eventLink: `${config_1.default.client_site_url}/events/${event.id}`,
    }, "invite");
    yield emailHelper_1.EmailHelper.sendEmail(inviteReceiver.email, html, `You're Invited to "${event.title}"`);
    console.log("🚀 ~ invite:", invite);
    return invite;
});
const getMyAllSendInvites = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const invites = yield prisma_1.default.invite.findMany({
        where: {
            inviteSenderId: userId,
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
                    venue: true
                }
            },
            invitee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true
                }
            }
        },
    });
    return invites;
});
const getMyAllReceivedInvites = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const invites = yield prisma_1.default.invite.findMany({
        where: {
            inviteReceiverId: userId,
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
                    venue: true
                }
            },
            inviter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true
                }
            },
            invitee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true
                }
            }
        },
    });
    return invites;
});
const acceptInvite = (inviteId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const invite = yield tx.invite.findUnique({
            where: { id: inviteId },
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
                        venue: true
                    }
                },
                invitee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        profileImage: true
                    }
                },
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        profileImage: true
                    }
                },
            },
        });
        if (!invite) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Invite not found");
        }
        const dataToCreateParticipant = {
            eventId: invite.eventId,
            userId: invite.inviteReceiverId,
            hasPaid: true,
        };
        const participant = yield participant_service_1.participantService.createParticipant(dataToCreateParticipant);
        if (participant) {
            yield tx.invite.update({
                where: { id: inviteId },
                data: { status: "ACCEPTED" },
            });
            yield tx.participant.update({
                where: { id: participant.id },
                data: { status: "APPROVED" },
            });
        }
    }));
    return result;
});
const getAllInvite = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = prisma_1.default.invite.findMany({
        where: {
            isDeleted: false
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
                    venue: true
                }
            },
            invitee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true
                }
            },
            inviter: {
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true
                }
            },
        },
    });
    return result;
});
const deleteInvite = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.invite.update({
        where: { id: id },
        data: { isDeleted: true },
    });
    return result;
});
exports.InviteService = {
    sentInvite, deleteInvite,
    getMyAllSendInvites,
    getMyAllReceivedInvites,
    acceptInvite,
    getAllInvite
};
