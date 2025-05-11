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
exports.paymentController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const payment_service_1 = require("./payment.service");
const RefineQuery_1 = __importDefault(require("../../helpers/RefineQuery"));
const payment_constants_1 = require("./payment.constants");
const createOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // console.log(user);
    const payload = Object.assign({ userId: user.id }, req === null || req === void 0 ? void 0 : req.body);
    const result = yield payment_service_1.paymentService.createPayment(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Payment created succesfully",
        data: result,
    });
}));
const getMyPayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield payment_service_1.paymentService.getMyPayments(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Payments retrieved successfully",
        data: result,
    });
}));
const getAllPayments = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = (0, RefineQuery_1.default)(req.query, payment_constants_1.paymentFilterableFields.concat('searchTerm'));
    const options = (0, RefineQuery_1.default)(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder',
    ]);
    const result = yield payment_service_1.paymentService.getAllPayments(query, options);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Payments fetched successfully',
        data: {
            data: result.data,
            meta: result.meta,
        },
    });
}));
exports.paymentController = {
    createOrder,
    getMyPayments,
    getAllPayments
};
