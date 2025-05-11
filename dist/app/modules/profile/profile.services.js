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
const prisma_1 = __importDefault(require("../../shared/prisma"));
const getSingleProfile = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUniqueOrThrow({ where: { id } });
    return result;
});
const updateUserProfile = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(payload)
    const userExist = yield prisma_1.default.user.findUniqueOrThrow({
        where: { id: userId },
    });
    if (!userExist) {
        throw new AppError_1.default(404, 'user not found');
    }
    const result = yield prisma_1.default.user.update({
        where: {
            id: userId,
        },
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            address: true,
            phoneNumber: true,
            profileImage: true,
            occupation: true,
        },
    });
    yield prisma_1.default.user.findUniqueOrThrow({ where: { id: userId } });
    return result;
});
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
