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
exports.userService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const jwtHelpers_1 = require("../../helpers/jwtHelpers");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const user_interface_1 = require("../user/user.interface");
const CalculatePagination_1 = __importDefault(require("../../helpers/CalculatePagination"));
const user_constants_1 = require("./user.constants");
// createUserIntoDB
const createUserIntoDB = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { password } = userData, restData = __rest(userData, ["password"]);
    try {
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email: restData.email },
        });
        if (existingUser) {
            throw new AppError_1.default(409, 'Email already exists');
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 12);
        const newUserData = Object.assign(Object.assign({}, restData), { password: hashPassword });
        // Create new user
        const newUser = yield prisma_1.default.user.create({
            data: newUserData,
        });
        // token payload
        const tokenPayload = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            profileImage: (_a = newUser.profileImage) !== null && _a !== void 0 ? _a : undefined,
            phoneNumber: newUser.phoneNumber,
            address: newUser.address,
            occupation: newUser.occupation,
            bio: newUser.bio,
            isDeleted: newUser.isDeleted,
            isBlocked: newUser.isBlocked,
        };
        const accessToken = jwtHelpers_1.jwtHelpers.createToken(tokenPayload, config_1.default.jwt.ACCESS_TOKEN_SECRET, config_1.default.jwt.ACCESS_TOKEN_EXPIRES_IN);
        const refreshToken = jwtHelpers_1.jwtHelpers.createToken(tokenPayload, config_1.default.jwt.REFRESH_TOKEN_SECRET, config_1.default.jwt.REFRESH_TOKEN_EXPIRES_IN);
        return {
            user: newUser,
            accessToken,
            refreshToken,
        };
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const field = (_c = (_b = error.meta) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c[0];
                if (field === 'email') {
                    throw new AppError_1.default(409, 'Email already exists');
                }
                else if (field === 'phoneNumber') {
                    // console.error('Phone number conflict detected');
                    throw new AppError_1.default(409, 'Phone number already exists');
                }
            }
        }
        throw new AppError_1.default(500, 'Failed to create or login user');
    }
});
// get User
const getAllUsersFromDB = (query, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, isBlocked, isDeleted, role } = query, otherFilters = __rest(query, ["searchTerm", "isBlocked", "isDeleted", "role"]);
    const { page, limit, skip, sortBy, sortOrder } = (0, CalculatePagination_1.default)(options);
    const searchConditions = [];
    if (searchTerm) {
        for (const field of user_constants_1.userSearchableFields) {
            const [relation, nestedField] = field.split('.');
            if (nestedField) {
                searchConditions.push({
                    [relation]: {
                        [nestedField]: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                });
            }
            else {
                searchConditions.push({
                    [field]: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                });
            }
        }
    }
    const filterConditions = [];
    if (isBlocked) {
        filterConditions.push({
            isBlocked: isBlocked,
        });
    }
    if (isDeleted) {
        filterConditions.push({
            isDeleted: isDeleted,
        });
    }
    if (role) {
        filterConditions.push({
            role: role,
        });
    }
    Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            filterConditions.push({ [key]: value });
        }
    });
    const where = Object.assign(Object.assign({}, (searchConditions.length > 0 && { OR: searchConditions })), (filterConditions.length > 0 && { AND: filterConditions }));
    const result = yield prisma_1.default.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        select: user_interface_1.publicUserSelectFields,
    });
    const total = yield prisma_1.default.user.count({ where });
    return {
        meta: { page, limit, total },
        data: result,
    };
});
// get single user by id
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    if (result.isBlocked) {
        throw new AppError_1.default(403, 'User is blocked');
    }
    return result;
});
// delete user
const deleteUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findFirstOrThrow({
        where: {
            id,
        },
    });
    if (userData.isBlocked) {
        throw new AppError_1.default(403, 'User is blocked');
    }
    const result = yield prisma_1.default.user.delete({
        where: {
            id,
        },
    });
    return result;
});
exports.userService = {
    createUserIntoDB,
    getSingleUserFromDB,
    getAllUsersFromDB,
    deleteUserFromDB,
};
