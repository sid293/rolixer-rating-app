"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreRatings = exports.getAllRatings = exports.deleteRating = exports.updateRating = exports.createRating = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const validations_1 = require("../lib/validations");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.createRating = (0, express_async_handler_1.default)(async (req, res) => {
    const { storeId } = req.params;
    const validatedData = validations_1.ratingSchema.parse(req.body);
    const store = await prisma_1.prisma.store.findUnique({
        where: { id: parseInt(storeId) },
    });
    if (!store) {
        throw new errorHandler_1.AppError(404, 'Store not found');
    }
    const existingRating = await prisma_1.prisma.rating.findUnique({
        where: {
            userId_storeId: {
                userId: req.user.id,
                storeId: parseInt(storeId),
            },
        },
    });
    if (existingRating) {
        throw new errorHandler_1.AppError(400, 'You have already rated this store');
    }
    const rating = await prisma_1.prisma.rating.create({
        data: {
            ...validatedData,
            userId: req.user.id,
            storeId: parseInt(storeId),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
            store: true,
        },
    });
    res.status(201).json({
        status: 'success',
        data: { rating },
    });
});
exports.updateRating = (0, express_async_handler_1.default)(async (req, res) => {
    const { storeId } = req.params;
    const validatedData = validations_1.ratingSchema.parse(req.body);
    const rating = await prisma_1.prisma.rating.findUnique({
        where: {
            userId_storeId: {
                userId: req.user.id,
                storeId: parseInt(storeId),
            },
        },
    });
    if (!rating) {
        throw new errorHandler_1.AppError(404, 'Rating not found');
    }
    const updatedRating = await prisma_1.prisma.rating.update({
        where: {
            userId_storeId: {
                userId: req.user.id,
                storeId: parseInt(storeId),
            },
        },
        data: validatedData,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
            store: true,
        },
    });
    res.json({
        status: 'success',
        data: { rating: updatedRating },
    });
});
exports.deleteRating = (0, express_async_handler_1.default)(async (req, res) => {
    const { storeId } = req.params;
    const rating = await prisma_1.prisma.rating.findUnique({
        where: {
            userId_storeId: {
                userId: req.user.id,
                storeId: parseInt(storeId),
            },
        },
    });
    if (!rating) {
        throw new errorHandler_1.AppError(404, 'Rating not found');
    }
    await prisma_1.prisma.rating.delete({
        where: {
            userId_storeId: {
                userId: req.user.id,
                storeId: parseInt(storeId),
            },
        },
    });
    res.json({
        status: 'success',
        data: null,
    });
});
exports.getAllRatings = (0, express_async_handler_1.default)(async (req, res) => {
    const ratings = await prisma_1.prisma.rating.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
            store: true,
        },
    });
    res.json({
        status: 'success',
        data: ratings,
    });
});
exports.getStoreRatings = (0, express_async_handler_1.default)(async (req, res) => {
    const { storeId } = req.params;
    const store = await prisma_1.prisma.store.findUnique({
        where: { id: parseInt(storeId) },
    });
    if (!store) {
        throw new errorHandler_1.AppError(404, 'Store not found');
    }
    const ratings = await prisma_1.prisma.rating.findMany({
        where: { storeId: parseInt(storeId) },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    res.json({
        status: 'success',
        data: { ratings },
    });
});
//# sourceMappingURL=ratingController.js.map