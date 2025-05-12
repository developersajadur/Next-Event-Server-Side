"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoute = void 0;
const express_1 = require("express");
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const payment_controller_1 = require("./payment.controller");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post("/make-payment", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), payment_controller_1.paymentController.createOrder);
router.get("/my-payments", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), payment_controller_1.paymentController.getMyPayments);
router.get("/", (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), payment_controller_1.paymentController.getAllPayments);
exports.paymentRoute = router;
