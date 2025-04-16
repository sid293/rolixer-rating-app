"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingSchema = exports.storeSchema = exports.loginSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    name: zod_1.z.string().min(20).max(60),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    address: zod_1.z.string().max(400).optional(),
    role: zod_1.z.enum(['ADMIN', 'USER', 'STORE_OWNER']).default('USER'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.storeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    email: zod_1.z.string().email(),
    address: zod_1.z.string().max(400).optional(),
});
exports.ratingSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
});
//# sourceMappingURL=validations.js.map