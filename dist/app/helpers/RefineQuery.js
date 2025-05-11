"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const RefineQuery = (obj, keys) => {
    const query = {};
    keys === null || keys === void 0 ? void 0 : keys.forEach(item => {
        if (Object.prototype.hasOwnProperty.call(obj, item)) {
            query[item] = obj[item];
        }
    });
    return query;
};
exports.default = RefineQuery;
