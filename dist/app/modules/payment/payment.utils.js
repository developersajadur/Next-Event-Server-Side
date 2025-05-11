"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactionId = void 0;
const generateTransactionId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${"NEXT"}${timestamp}${randomString}`;
};
exports.generateTransactionId = generateTransactionId;
