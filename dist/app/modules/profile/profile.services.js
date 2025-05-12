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
exports.ProfileService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const fileUploader_1 = require("../../helpers/fileUploader");
// import { IFile } from '../../interfaces/file';
const prisma_1 = __importDefault(require("../../shared/prisma"));
const profile_constraint_1 = require("./profile.constraint");
// get single profile
const getSingleProfile = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUniqueOrThrow({ where: { id } });
    return result;
});
// update profile
const updateUserProfile = (userId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userExist = yield prisma_1.default.user.findUniqueOrThrow({
            where: { id: userId },
        });
        if (!userExist) {
            throw new AppError_1.default(404, 'User not found');
        }
        // if (!userExist.password) {
        //   throw new AppError(403, 'Social login users are not allowed to update their profile');
        // }
        const { userId: _ } = payload, updateData = __rest(payload, ["userId"]);
        if (file) {
            const uploadResult = yield fileUploader_1.fileUploads.uploadToCloudinary(file);
            updateData.profileImage = uploadResult.secure_url;
        }
        const user = yield prisma_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: profile_constraint_1.selectFields,
        });
        const { password } = user, rest = __rest(user, ["password"]);
        const result = Object.assign(Object.assign({}, rest), { isSocialLogin: !password });
        return result;
    }
    catch (error) {
        throw new AppError_1.default(403, 'failed ');
    }
});
// get myProfile
const getMyProfileData = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUnique({
        where: {
            id: id,
        },
    });
    if (!result || result.isBlocked || result.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User Not Found');
    }
    const { password } = result, user = __rest(result, ["password"]);
    return user;
});
exports.ProfileService = {
    getSingleProfile,
    updateUserProfile,
    getMyProfileData,
};
