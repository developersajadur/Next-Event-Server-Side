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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaQueryBuilder = PrismaQueryBuilder;
function PrismaQueryBuilder(_a) {
    return __awaiter(this, arguments, void 0, function* ({ model, where = {}, searchFields = [], search = '', sortField = 'createdAt', sortOrder = 'desc', page = 1, limit = 10, }) {
        const skip = (page - 1) * limit;
        let searchFilter = {};
        if (search && searchFields.length > 0) {
            searchFilter = {
                OR: searchFields.map((field) => ({
                    [field]: { contains: search, mode: 'insensitive' },
                })),
            };
        }
        const combinedWhere = {
            AND: [{ isDeleted: false }, where, searchFilter],
        };
        const result = yield model.findMany({
            where: combinedWhere,
            orderBy: { [sortField]: sortOrder },
            skip,
            take: limit,
        });
        const total = yield model.count({ where: combinedWhere });
        return {
            data: result,
            meta: {
                page,
                limit,
                total,
            },
        };
    });
}
