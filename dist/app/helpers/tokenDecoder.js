"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenDecoder = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const config_1 = __importDefault(require("../config"));
const jwtHelpers_1 = require("./jwtHelpers");
const tokenDecoder = (req) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You Are Not Authorized');
    }
    const decoded = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.REFRESH_TOKEN_SECRET);
    return decoded;
};
exports.tokenDecoder = tokenDecoder;
