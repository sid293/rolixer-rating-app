"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = void 0;
const prisma_1 = require("../lib/prisma");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.getAdminStats = (0, express_async_handler_1.default)(async (req, res) => {
    // console.log("getAdminStats")
    const [users, stores, ratings] = await Promise.all([
        prisma_1.prisma.user.findMany(),
        prisma_1.prisma.store.count(),
        prisma_1.prisma.rating.count()
    ]);
    //   console.log("users stores rating: ",users, stores, ratings)
    res.json({
        status: 'success',
        data: {
            totalUsers: users.length,
            totalStores: stores,
            totalRatings: ratings,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }))
        }
    });
});
//# sourceMappingURL=adminController.js.map