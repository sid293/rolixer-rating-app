"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStore = exports.updateStore = exports.getStore = exports.getStores = exports.createStore = void 0;
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
// import { CreateStoreInput, storeSchema } from '../lib/validations';
const validations_1 = require("../lib/validations");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.createStore = (0, express_async_handler_1.default)(async (req, res) => {
    const validatedData = validations_1.storeSchema.parse(req.body);
    const store = await prisma_1.prisma.store.create({
        data: {
            ...validatedData,
            ownerId: req.user.id,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    res.status(201).json({
        status: 'success',
        data: { store },
    });
});
exports.getStores = (0, express_async_handler_1.default)(async (req, res) => {
    console.log("getting stores");
    const stores = await prisma_1.prisma.store.findMany({
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    res.json({
        status: 'success',
        data: stores,
    });
});
exports.getStore = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    console.log("get store for : ", id);
    console.log("get store for type : ", typeof id);
    const store = await prisma_1.prisma.store.findFirst({
        where: {
            owner: {
                email: id
            }
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            ratings: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    console.log("sending store back:", store);
    if (!store) {
        throw new errorHandler_1.AppError(404, 'Store not found');
    }
    res.json({
        status: 'success',
        data: { store },
    });
});
exports.updateStore = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const validatedData = validations_1.storeSchema.partial().parse(req.body);
    const store = await prisma_1.prisma.store.findUnique({
        where: { id: parseInt(id) },
    });
    if (!store) {
        throw new errorHandler_1.AppError(404, 'Store not found');
    }
    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new errorHandler_1.AppError(403, 'Not authorized to update this store');
    }
    const updatedStore = await prisma_1.prisma.store.update({
        where: { id: parseInt(id) },
        data: validatedData,
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    res.json({
        status: 'success',
        data: { store: updatedStore },
    });
});
exports.deleteStore = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const store = await prisma_1.prisma.store.findUnique({
        where: { id: parseInt(id) },
    });
    if (!store) {
        throw new errorHandler_1.AppError(404, 'Store not found');
    }
    if (store.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new errorHandler_1.AppError(403, 'Not authorized to delete this store');
    }
    await prisma_1.prisma.store.delete({
        where: { id: parseInt(id) },
    });
    res.json({
        status: 'success',
        data: null,
    });
});
//# sourceMappingURL=storeController.js.map