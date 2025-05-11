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
exports.InvoiceService = void 0;
const prisma_1 = __importDefault(require("../shared/prisma"));
const date_fns_1 = require("date-fns");
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const emailHelper_1 = require("./emailHelper");
exports.InvoiceService = {
    sendInvoiceEmail(userId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
            const order = yield prisma_1.default.payment.findUnique({
                where: { id: orderId },
                include: {
                    event: true,
                },
            });
            if (!user || !order) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User or payment record not found');
            }
            const invoiceData = {
                invoiceId: order.id,
                createdAt: (0, date_fns_1.format)(order.createdAt, 'PPP'),
                user: {
                    name: user.name,
                    email: user.email,
                },
                event: {
                    title: order.event.title,
                },
                eventType: order.event.type || 'Public',
                paymentMethod: order.method,
                paymentStatus: order.status,
                totalAmount: order.amount,
                discount: '0.00',
                deliveryCharge: '0.00',
                finalAmount: order.amount,
                year: new Date().getFullYear(),
            };
            const html = yield emailHelper_1.EmailHelper.createEmailContent(invoiceData, 'orderInvoice');
            yield emailHelper_1.EmailHelper.sendEmail(user.email, html, 'Next Event | Registration Invoice');
        });
    },
};
