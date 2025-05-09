"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculatePagination = (options) => {
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = (options.sortOrder === 'asc' ? 'asc' : 'desc');
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 20;
    const skip = (Number(page) - 1) * limit;
    return { page, limit, skip, sortBy, sortOrder };
};
exports.default = calculatePagination;
