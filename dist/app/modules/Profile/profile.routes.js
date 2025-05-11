"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const fileUploader_1 = require("../../helpers/fileUploader");
const Auth_1 = __importDefault(require("../../middlewares/Auth"));
const profile_controller_1 = require("../profile/profile.controller");
const router = (0, express_1.Router)();
router.get('/:id', (0, Auth_1.default)('ADMIN', 'USER'), profile_controller_1.ProfileController.getSingleProfile);
// update profile
router.patch('/:userId', (0, Auth_1.default)(client_1.Role.USER), fileUploader_1.fileUploads.upload.single('profileImage'), profile_controller_1.ProfileController.updateUserProfile);
// get profile
router.get('/get/my-profile-data', (0, Auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), profile_controller_1.ProfileController.getMyProfileData);
exports.profileRoutes = router;
