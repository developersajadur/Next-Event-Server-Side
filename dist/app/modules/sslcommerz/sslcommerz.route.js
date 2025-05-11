"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLRoutes = void 0;
const express_1 = require("express");
const sslcommerz_controller_1 = require("./sslcommerz.controller");
const router = (0, express_1.Router)();
// Define routes
router.get('/check-validate-payment', sslcommerz_controller_1.SSLController.validatePaymentService);
router.post('/ipn', sslcommerz_controller_1.SSLController.handleIPN);
exports.SSLRoutes = router;
