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
exports.ReviewServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const http_status_1 = __importDefault(require("http-status"));
// eslint-disable-next-line no-unused-vars
const createReview = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Payload:", payload);
    const event = yield prisma_1.default.event.findUnique({
        where: {
            id: payload.eventId,
        },
    });
    if (!event || event.isDeleted) {
        console.log("Event not found");
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Event not found");
    }
    const existingReview = yield prisma_1.default.review.findFirst({
        where: {
            reviewerId: payload.userId,
            eventId: payload.eventId,
            isDeleted: false,
        },
    });
    if (existingReview) {
        console.log(existingReview);
        throw new AppError_1.default(http_status_1.default.NOT_ACCEPTABLE, "You already reviewed this event");
    }
    console.log("Checking participation for:", {
        eventId: payload.eventId,
        userId: payload.userId,
    });
    // const participation = await prisma.participant.findFirst({
    //   where: {
    //     eventId: payload.eventId,
    //     userId: payload.userId,    
    //   },
    // });
    // if (!participation) {
    //     throw new AppError(httpStatus.NOT_ACCEPTABLE ,"You didn't attend this event")      
    // }
    const result = yield prisma_1.default.review.create({
        data: {
            rating: payload.rating,
            comment: payload.comment,
            event: {
                connect: { id: payload.eventId },
            },
            reviewer: {
                connect: { id: payload.userId },
            },
        },
    });
    return result;
});
const getAllReview = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findMany({
        where: Object.assign(Object.assign({ isDeleted: false }, ((filter === null || filter === void 0 ? void 0 : filter.rating) && { rating: filter.rating })), ((filter === null || filter === void 0 ? void 0 : filter.user) && {
            reviewer: {
                name: {
                    contains: filter.user,
                    mode: 'insensitive',
                },
            },
        })),
        include: {
            event: true,
            reviewer: true,
        },
    });
    return result;
});
// Get current user's reviews
const getMyReviews = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findUnique({
        where: { id },
        include: {
            reviewer: true
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "No review found with this ID");
    }
    //console.log("my Review Data..........: ", result);
    return result;
});
const updateReview = (reviewId, userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const review = yield prisma_1.default.review.findUnique({ where: {
            id: reviewId
        }
    });
    if (!review || review.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Review not found");
    }
    if (review.reviewerId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You can only update your own review");
    }
    const result = yield prisma_1.default.review.update({
        where: {
            id: reviewId
        },
        data: {
            rating: (_a = payload.rating) !== null && _a !== void 0 ? _a : review.rating,
            comment: (_b = payload.comment) !== null && _b !== void 0 ? _b : review.comment,
        },
    });
    return result;
});
const deleteReview = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield prisma_1.default.review.findUnique({ where: { id } });
    if (!review || review.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Review not found or already deleted");
    }
    if (review.reviewerId !== id) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "You can only delete your own review");
    }
    const result = yield prisma_1.default.review.update({
        where: { id },
        data: { isDeleted: true },
    });
    return result;
});
const myAllReviews = (reviewerId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield prisma_1.default.review.findMany({
        where: {
            reviewerId,
            isDeleted: false,
        },
        include: {
            event: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return reviews;
});
const getReviewsByEvent = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield prisma_1.default.review.findMany({
        where: {
            eventId: eventId,
            isDeleted: false,
        },
        select: {
            comment: true,
            rating: true,
            createdAt: true,
            eventId: true,
            reviewer: {
                select: {
                    name: true,
                    email: true,
                    profileImage: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    const transformedReviews = reviews.map((review) => ({
        name: review.reviewer.name,
        role: 'User',
        comment: review.comment,
        rating: review.rating,
        image: review.reviewer.profileImage || '/placeholder.svg',
        eventId: review.eventId,
    }));
    return transformedReviews;
});
exports.ReviewServices = {
    createReview,
    getAllReview,
    deleteReview,
    updateReview,
    getMyReviews,
    myAllReviews,
    getReviewsByEvent
};
