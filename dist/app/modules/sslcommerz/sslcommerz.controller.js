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
exports.SSLController = void 0;
const config_1 = __importDefault(require("../../config"));
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const sslcommerz_service_1 = require("./sslcommerz.service");
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const validatePaymentService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tran_id = req.query.tran_id;
    // console.log(tran_id);
    const result = yield sslcommerz_service_1.sslCommerzService.validatePayment(tran_id);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Payment successful",
            data: {
                redirect_url: config_1.default.ssl.success_url
            },
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.PAYMENT_REQUIRED,
            success: false,
            message: "Payment failed",
            data: {
                redirect_url: config_1.default.ssl.failed_url
            },
        });
    }
}));
const handleIPN = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id } = req.body;
    const result = yield sslcommerz_service_1.sslCommerzService.validatePayment(tran_id);
    if (result) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Payment successful",
            data: result,
        });
    }
    else {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Payment failed");
    }
}));
exports.SSLController = {
    validatePaymentService,
    handleIPN
};
