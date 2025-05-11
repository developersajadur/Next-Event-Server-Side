"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelpers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const createToken = (payload, secret, expiresIn) => {
    if (!secret || typeof secret !== 'string') {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT Secret is missing or invalid');
    }
    if (!expiresIn ||
        (typeof expiresIn !== 'string' && typeof expiresIn !== 'number')) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'JWT Expiry is invalid');
    }
    const signOptions = {
        expiresIn: expiresIn,
        algorithm: 'HS256',
    };
    try {
        return jsonwebtoken_1.default.sign(payload, secret, signOptions);
    }
    catch (error) {
        console.error('Error creating token:', error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create JWT');
    }
};
// Verify token
const verifyToken = (token, secret) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded.id) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Token missing essential fields');
        }
        return decoded;
    }
    catch (error) {
        const err = error;
        console.error('Token verification error:', err);
        if (err.name === 'JsonWebTokenError') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Invalid token signature');
        }
        else if (err.name === 'TokenExpiredError') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Token expired');
        }
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Forbidden');
    }
};
exports.jwtHelpers = {
    createToken,
    verifyToken,
};
