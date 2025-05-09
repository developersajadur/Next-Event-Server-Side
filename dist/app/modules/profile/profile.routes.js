"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRoutes = void 0;
const client_1 = require("@prisma/client");
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const express_1 = require("express");
const profile_controller_1 = require("../profile/profile.controller");
const router = (0, express_1.Router)();
router.get('/:id', (0, Auth_1.default)('ADMIN', 'USER'), profile_controller_1.ProfileController.getSingleProfile);
router.patch("/:userId", (0, Auth_1.default)(client_1.Role.USER), profile_controller_1.ProfileController.updateUserProfile);
router.get('/get/my-profile-data', (0, Auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), profile_controller_1.ProfileController.getMyProfileData);
exports.profileRoutes = router;
