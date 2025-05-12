"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.authService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const jwtHelpers_1 = require("../../helpers/jwtHelpers");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const auth_constant_1 = require("./auth.constant");
const emailSender_1 = __importDefault(require("./emailSender"));
// login user
const loginUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (!userData) {
        throw new AppError_1.default(404, 'User not found!');
    }
    if (userData.isBlocked) {
        throw new AppError_1.default(403, 'User is blocked!');
    }
    const isCorrectPassword = yield bcrypt.compare(data.password, userData.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(403, 'You have given a wrong password!');
    }
    // token payload
    const tokenPayload = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage,
    };
    // access token
    const accessToken = jwtHelpers_1.jwtHelpers.createToken(tokenPayload, config_1.default.jwt.ACCESS_TOKEN_SECRET, config_1.default.jwt.ACCESS_TOKEN_EXPIRES_IN);
    // refresh token
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken(tokenPayload, config_1.default.jwt.REFRESH_TOKEN_SECRET, config_1.default.jwt.REFRESH_TOKEN_EXPIRES_IN);
    return {
        accessToken,
        refreshToken,
    };
});
// refresh
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = yield jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.REFRESH_TOKEN_SECRET);
    }
    catch (_a) {
        throw new Error('You are not authorized');
    }
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            isBlocked: false,
        },
    });
    const tokenPayload = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage,
        id: userData.id,
    };
    const accessToken = jwtHelpers_1.jwtHelpers.createToken(tokenPayload, config_1.default.jwt.ACCESS_TOKEN_SECRET, config_1.default.jwt.ACCESS_TOKEN_EXPIRES_IN);
    return {
        accessToken,
    };
});
// password change
const passwordChange = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });
    if (userData.isBlocked) {
        throw new AppError_1.default(403, 'User is blocked');
    }
    const isCorrectPassword = yield bcrypt.compare(payload.oldPassword, userData.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(401, 'Password Incorrect');
    }
    const hashPassword = yield bcrypt.hash(payload.newPassword, 12);
    yield prisma_1.default.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashPassword,
        },
    });
    return {
        message: 'Password changed successfully',
    };
});
// getProfileInfo
const getProfileInfo = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = yield jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.ACCESS_TOKEN_SECRET);
    const userId = decoded === null || decoded === void 0 ? void 0 : decoded.id;
    // console.log(userId)
    if (!userId) {
        throw new AppError_1.default(401, 'Invalid Token Payload');
    }
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: auth_constant_1.safeUserData,
    });
    if (!user) {
        throw new AppError_1.default(404, 'User not found');
    }
    return user;
});
// forgot password
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            isBlocked: false,
        },
    });
    // token generate
    const resetPassToken = jwtHelpers_1.jwtHelpers.createToken({ email: userData.email, role: userData.role, id: userData.id }, config_1.default.jwt.RESET_PASSWORD_SECRET, config_1.default.jwt.RESET_PASSWORD_TOKEN_EXP_IN);
    // reset password link
    const resetPassLink = config_1.default.jwt.RESET_PASSWORD_LINK +
        `?userId=${userData.id}&token=${resetPassToken}`;
    // console.log(resetPassLink);
    yield (0, emailSender_1.default)(userData.email, `<div style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px; border-radius: 8px;">
    <p style="font-size: 16px; color: #333;">Dear User,</p>
  
    <p style="font-size: 16px; color: #333;">
      We received a request to reset your password. Please click the button below to reset your password.
    </p>
  
    <p style="margin-top: 20px;">
      <a href="${resetPassLink}" 
         style="text-decoration: none; display: inline-block; background-color: #4CAF50; padding: 12px 24px; color: white; font-size: 16px; border-radius: 4px; text-align: center; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">
        <i class="fas fa-lock" style="margin-right: 8px;"></i> Reset Password
      </a>
    </p>
  
    <p style="font-size: 14px; color: #777;">If you did not request a password reset, please ignore this email.</p>
  </div>
  
    `);
    return {
        message: 'A password reset link has been sent to your email.',
    };
});
// reset-password
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield prisma_1.default.user.findUniqueOrThrow({
            where: {
                id: payload.userId,
            },
        });
        if (User.isBlocked) {
            throw new AppError_1.default(403, 'User is blocked');
        }
        // Verify
        const decoded = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.RESET_PASSWORD_SECRET);
        if (decoded.email !== User.email) {
            throw new AppError_1.default(403, 'Invalid reset token');
        }
        // hash password
        const hashedPassword = yield bcrypt.hash(payload.newPassword, 12);
        // Update password
        yield prisma_1.default.user.update({
            where: {
                id: payload.userId,
            },
            data: {
                password: hashedPassword,
            },
        });
        return { success: true, message: 'Password updated successfully' };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Reset password error:', error);
        throw new AppError_1.default(403, 'Forbidden: Unable to reset password');
    }
});
exports.authService = {
    loginUser,
    refreshToken,
    passwordChange,
    forgotPassword,
    resetPassword,
    getProfileInfo,
};
