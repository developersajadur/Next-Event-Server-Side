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
exports.paymentService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const http_status_1 = __importDefault(require("http-status"));
const payment_utils_1 = require("./payment.utils");
const sslcommerz_service_1 = require("../sslcommerz/sslcommerz.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CalculatePagination_1 = __importDefault(require("../../helpers/CalculatePagination"));
const payment_constants_1 = require("./payment.constants");
const createPayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { method, status = 'Pending', userId, eventId, gatewayResponse = null, } = payload;
    // Step 1: Validate Event Existence & Status
    const event = yield prisma_1.default.event.findUnique({
        where: { id: eventId },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found!');
    }
    if (event.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event is deleted!');
    }
    if (!event.isPaid) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This event is free. No payment required.');
    }
    const transactionId = (0, payment_utils_1.generateTransactionId)();
    // Step 2: Create Payment inside Transaction
    const createdPayment = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const existingPayment = yield tx.payment.findFirst({
            where: {
                userId,
                eventId,
                status: 'Paid',
            },
        });
        if (existingPayment) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have already registered for this event!');
        }
        return yield tx.payment.create({
            data: {
                transactionId,
                amount: Number(event.fee),
                method,
                status,
                userId,
                eventId,
                gatewayResponse: gatewayResponse !== null && gatewayResponse !== void 0 ? gatewayResponse : client_1.Prisma.DbNull,
            },
        });
    }));
    // Step 3: Refetch related data outside the transaction
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    // Step 4: Handle Online Payment Gateway
    if (method === 'Online') {
        const sslResponse = yield sslcommerz_service_1.sslCommerzService.initPayment({
            total_amount: Number(event.fee),
            tran_id: transactionId,
            cus_name: user.name,
            cus_email: user.email,
            cus_phone: user.phoneNumber,
            product_name: event.title,
            product_category: event.type,
        });
        return { paymentUrl: sslResponse };
    }
    // Step 5: Return payment info for 'Cash' or 'Offline' method
    return Object.assign(Object.assign({}, createdPayment), { user,
        event });
});
const getMyPayments = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield prisma_1.default.payment.findMany({
        where: {
            userId
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
        },
    });
    return payments;
});
const getAllPayments = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = query, filters = __rest(query, ["searchTerm"]);
    const { page, limit, skip, sortBy, sortOrder } = (0, CalculatePagination_1.default)(options);
    const searchConditions = [];
    if (searchTerm) {
        for (const field of payment_constants_1.paymentSearchableFields) {
            const [relation, nestedField] = field.split('.');
            if (nestedField) {
                searchConditions.push({
                    [relation]: {
                        [nestedField]: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                });
            }
            else {
                searchConditions.push({
                    [field]: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                });
            }
        }
    }
    const filterConditions = Object.entries(filters).map(([key, value]) => ({
        [key]: typeof value === 'string' && (value === 'true' || value === 'false')
            ? value === 'true'
            : value,
    }));
    const where = Object.assign(Object.assign({}, (searchConditions.length && { OR: searchConditions })), (filterConditions.length && { AND: filterConditions }));
    const result = yield prisma_1.default.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy || 'createdAt']: sortOrder || 'desc',
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
            user: {
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    profileImage: true
                }
            },
        },
    });
    const total = yield prisma_1.default.payment.count({ where });
    return {
        meta: { page, limit, total },
        data: result,
    };
});
exports.paymentService = {
    createPayment,
    getMyPayments,
    getAllPayments
};
