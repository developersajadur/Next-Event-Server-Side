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
exports.eventService = void 0;
const fileUploader_1 = require("../../helpers/fileUploader");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const event_constants_1 = require("./event.constants");
const CalculatePagination_1 = __importDefault(require("../../helpers/CalculatePagination"));
const slugify_1 = __importDefault(require("slugify"));
const createEvent = (Request) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Request.body;
    const bannerImage = Request.file;
    // console.log(bannerImage);
    payload.organizerId = Request.user.id;
    if (bannerImage) {
        const UploadToCloudinary = yield fileUploader_1.fileUploads.uploadToCloudinary(bannerImage);
        payload.bannerImage = UploadToCloudinary.secure_url;
    }
    if (payload.title) {
        const baseSlug = (0, slugify_1.default)(payload.title, {
            lower: true,
            strict: true,
        }).replace(/[^\w\s-]/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (yield prisma_1.default.event.findUnique({
            where: {
                slug,
            },
        })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        payload.slug = slug;
    }
    // console.log(payload);
    const result = yield prisma_1.default.event.create({
        data: payload,
    });
    return result;
});
const updateEvent = (Request) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Request.body;
    const bannerImage = Request.file;
    const eventId = Request.params.id;
    payload.organizerId = String(Request.user.id);
    if (payload.title) {
        const baseSlug = (0, slugify_1.default)(payload.title, {
            lower: true,
            strict: true,
        }).replace(/[^\w\s-]/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (yield prisma_1.default.event.findFirst({
            where: {
                slug,
                NOT: { id: eventId },
            },
        })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        payload.slug = slug;
    }
    if (bannerImage) {
        const uploadResult = yield fileUploader_1.fileUploads.uploadToCloudinary(bannerImage);
        payload.bannerImage = uploadResult.secure_url;
    }
    const result = yield prisma_1.default.event.update({
        where: {
            id: Request.params.id,
            isDeleted: false,
        },
        data: payload,
    });
    return result;
});
const getAllEvents = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, minFee, maxFee, isPaid, isPrivate, eventStatus } = query, filteredData = __rest(query, ["searchTerm", "minFee", "maxFee", "isPaid", "isPrivate", "eventStatus"]);
    const Query = [];
    const { page, limit, skip, sortBy, sortOrder } = (0, CalculatePagination_1.default)(options);
    if (searchTerm) {
        Query.push({
            OR: event_constants_1.eventSearchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: 'insensitive' },
            })),
        });
    }
    if (eventStatus) {
        Query.push({
            eventStatus,
        });
    }
    if (minFee && maxFee) {
        Query.push({
            fee: {
                gte: Number(minFee),
                lte: Number(maxFee),
            },
        });
    }
    if (typeof isPaid !== 'undefined') {
        Query.push({
            isPaid: isPaid === 'true',
        });
    }
    Query.push({
        isDeleted: false,
    });
    if (typeof isPrivate !== 'undefined') {
        Query.push({
            type: isPrivate,
        });
    }
    Query.push({
        isDeleted: false,
    });
    if (Object.keys(filteredData).length > 0)
        Query.push({
            AND: Object.keys(filteredData).map((key) => ({
                [key]: filteredData[key],
            })),
        });
    const QueryCondition = { AND: Query };
    const result = yield prisma_1.default.event.findMany({
        where: QueryCondition,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });
    const total = yield prisma_1.default.event.count({
        where: QueryCondition,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getSingleEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.findUniqueOrThrow({
        where: { id, isDeleted: false },
        include: {
            organizer: true,
        },
    });
    return result;
});
const getMyEvents = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.findMany({
        where: { organizerId: payload.id, isDeleted: false },
        include: {
            participants: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                        },
                    },
                },
            }
        }
    });
    return result;
});
const getSingleEventBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.findUniqueOrThrow({
        where: { slug, isDeleted: false },
        include: {
            organizer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true,
                    occupation: true,
                    address: true,
                    phoneNumber: true,
                },
            },
            participants: {
                select: {
                    userId: true,
                },
            },
        },
    });
    return result;
});
const deleteEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(id);
    yield prisma_1.default.event.findUniqueOrThrow({
        where: { id },
    });
    const result = yield prisma_1.default.event.update({
        where: { id },
        data: { isDeleted: true },
    });
    return result;
});
exports.eventService = {
    createEvent,
    getAllEvents,
    getSingleEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    getSingleEventBySlug,
};
