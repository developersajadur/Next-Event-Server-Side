"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
router.post('/login', auth_controller_1.authControlller.loginUser);
router.post('/refreshToken', auth_controller_1.authControlller.refreshToken);
router.post('/change-password', (0, Auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), auth_controller_1.authControlller.passwordChange);
router.get('/profile', auth_controller_1.authControlller.getProfileInfo);
router.post('/forget-password', auth_controller_1.authControlller.forgotPassword);
router.post('/reset-password', auth_controller_1.authControlller.resetPassword);
router.post('/logout', auth_controller_1.authControlller.logOut);
exports.authRoutes = router;
