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
exports.sslCommerzService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const config_1 = __importDefault(require("../../config"));
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const generatePaymentInvoicePDF_1 = require("../../helpers/generatePaymentInvoicePDF");
const emailHelper_1 = require("../../helpers/emailHelper");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const participant_service_1 = require("../participant/participant.service");
const store_id = config_1.default.ssl.store_id;
const store_passwd = config_1.default.ssl.store_pass;
const is_live = false;
const initPayment = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    const { total_amount, tran_id, cus_name, cus_email, cus_phone, product_name, product_category, } = paymentData;
    const data = {
        total_amount,
        currency: 'BDT',
        tran_id,
        success_url: `${config_1.default.ssl.success_url}/${tran_id}`,
        fail_url: config_1.default.ssl.failed_url,
        cancel_url: config_1.default.ssl.cancel_url,
        ipn_url: config_1.default.ssl.ipn_url,
        shipping_method: 'Courier',
        product_name,
        product_category,
        product_profile: 'general',
        cus_name,
        cus_email,
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone,
        cus_fax: cus_phone,
        ship_name: cus_name,
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, is_live);
    try {
        const apiResponse = yield sslcz.init(data);
        const GatewayPageURL = apiResponse.GatewayPageURL;
        if (GatewayPageURL) {
            return GatewayPageURL;
        }
        else {
            throw new AppError_1.default(http_status_1.default.BAD_GATEWAY, 'Failed to generate payment gateway URL.');
        }
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An error occurred while processing payment.');
    }
});
const validatePayment = (tran_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, is_live);
    try {
        const validationResponse = yield sslcz.transactionQueryByTransactionId({
            tran_id,
        });
        const gatewayData = (_a = validationResponse.element) === null || _a === void 0 ? void 0 : _a[0];
        // console.log(gatewayData);
        if (!gatewayData) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid transaction response.');
        }
        if (gatewayData.status === 'INVALID') {
            yield prisma_1.default.payment.update({
                where: { transactionId: tran_id },
                data: {
                    status: 'Failed',
                    gatewayResponse: gatewayData || null,
                },
            });
            throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, 'Payment failed.');
        }
        const paymentRecord = yield prisma_1.default.payment.findUnique({
            where: { transactionId: tran_id },
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
                        name: true,
                        email: true,
                        phoneNumber: true,
                        profileImage: true
                    }
                },
            },
        });
        if (!paymentRecord) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment record not found.');
        }
        // console.log(paymentRecord.user);
        const user = paymentRecord.user;
        const paymentStatus = ['VALID', 'VALIDATED'].includes(gatewayData.status)
            ? 'Paid'
            : 'Failed';
        // console.log(paymentStatus);
        if (paymentStatus === 'Failed') {
            throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, 'Payment failed.');
        }
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const updatedPayment = yield tx.payment.update({
                where: { transactionId: tran_id },
                data: {
                    status: paymentStatus,
                    gatewayResponse: gatewayData || null,
                },
            });
            // console.log(updatedPayment);
            if (!updatedPayment) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment record not found or not updated.');
            }
            const payment = yield tx.payment.findUnique({
                where: { id: updatedPayment.id },
            });
            if (!payment) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment record not found.');
            }
            if (payment.status === 'Paid') {
                const dataToCreateParticipant = {
                    eventId: payment.eventId,
                    userId: payment.userId,
                    hasPaid: true,
                };
                yield participant_service_1.participantService.createParticipant(dataToCreateParticipant);
                const invite = yield prisma_1.default.invite.findFirst({
                    where: { eventId: payment.eventId },
                });
                //  return   console.log(invite, "invite");
                if (invite) {
                    const updateInviteStatus = yield tx.invite.update({
                        where: { id: invite.id },
                        data: { status: 'ACCEPTED' },
                    });
                    if (!updateInviteStatus) {
                        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invite record not found or not updated.');
                    }
                    // return console.log(updateInviteStatus, "updateInviteStatus");
                    const existingParticipant = yield tx.participant.findUnique({
                        where: {
                            userId_eventId: {
                                userId: invite.inviteReceiverId,
                                eventId: invite.eventId,
                            },
                        },
                    });
                    if (!existingParticipant) {
                        // Optionally, create it or skip update
                        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found for invited user.');
                    }
                    const updateParticipantStatus = yield tx.participant.update({
                        where: {
                            userId_eventId: {
                                userId: invite.inviteReceiverId,
                                eventId: invite.eventId,
                            },
                        },
                        data: { status: 'APPROVED' },
                    });
                    if (!updateParticipantStatus) {
                        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant record not found or not updated.');
                    }
                }
                const emailContent = yield emailHelper_1.EmailHelper.createEmailContent({
                    invoiceId: paymentRecord.transactionId,
                    createdAt: new Date(paymentRecord.createdAt).toLocaleDateString('en-BD'),
                    user: {
                        name: user === null || user === void 0 ? void 0 : user.name,
                        email: user.email,
                    },
                    event: {
                        title: paymentRecord.event.title,
                    },
                    eventType: paymentRecord.event.type,
                    paymentMethod: paymentRecord.method,
                    paymentStatus: paymentRecord.status,
                    totalAmount: paymentRecord.amount.toFixed(2),
                    discount: (0).toFixed(2),
                    deliveryCharge: (0).toFixed(2),
                    finalAmount: paymentRecord.amount.toFixed(2),
                    year: new Date().getFullYear(),
                }, 'orderInvoice');
                const pdfBuffer = yield (0, generatePaymentInvoicePDF_1.generateOrderInvoicePDF)(paymentRecord);
                const attachment = {
                    filename: `Invoice_${tran_id}.pdf`,
                    content: pdfBuffer,
                    encoding: 'base64',
                };
                yield emailHelper_1.EmailHelper.sendEmail(user.email, emailContent, 'Order confirmed - Payment Success!', attachment);
                return true;
            }
            return false;
        }), {
            timeout: 100000,
        });
        return result;
    }
    catch (error) {
        console.error(error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An error occurred while validating payment.');
    }
});
exports.sslCommerzService = {
    initPayment,
    validatePayment,
};
