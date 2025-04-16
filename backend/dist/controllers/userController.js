"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.deleteUser = exports.getAllUsers = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
// import { CreateUserInput, LoginInput, userSchema, loginSchema } from '../lib/validations';
const validations_1 = require("../lib/validations");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const zod_1 = require("zod");
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const signOptions = {
        expiresIn: '30d',
    };
    return jsonwebtoken_1.default.sign({ userId }, secret, signOptions);
};
exports.register = (0, express_async_handler_1.default)(async (req, res) => {
    console.log("register hit");
    try {
        console.log("before validate data");
        const validatedData = validations_1.userSchema.parse(req.body);
        console.log("validate data: ", validatedData);
        const { password, ...userData } = validatedData;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                address: true,
            },
        });
        // If user is a store owner, create a store entry
        if (userData.role === 'STORE_OWNER') {
            await prisma_1.prisma.store.create({
                data: {
                    name: `${userData.name}'s Store`,
                    email: userData.email,
                    address: userData.address,
                    ownerId: user.id,
                },
            });
        }
        const token = generateToken(user.id);
        res.status(201).json({
            status: 'success',
            data: { user, token },
        });
    }
    catch (error) {
        console.log("error: ", error);
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    const target = error.meta?.target;
                    throw new errorHandler_1.AppError(409, `A user with this ${target[0]} already exists`);
                case 'P2014':
                    throw new errorHandler_1.AppError(400, 'Invalid relation data provided');
                case 'P2003':
                    throw new errorHandler_1.AppError(400, 'Invalid reference data provided');
                default:
                    throw new errorHandler_1.AppError(400, 'Database operation failed');
            }
        }
        if (error instanceof zod_1.z.ZodError) {
            const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new errorHandler_1.AppError(400, errorMessage);
        }
        throw new errorHandler_1.AppError(400, 'Invalid data');
    }
});
exports.getAllUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            address: true,
        },
    });
    res.json({
        status: 'success',
        data: users,
    });
});
exports.deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = parseInt(req.params.id);
    await prisma_1.prisma.user.delete({
        where: { id: userId },
    });
    res.json({
        status: 'success',
        message: 'User deleted successfully',
    });
});
exports.login = (0, express_async_handler_1.default)(async (req, res) => {
    console.log("login hit");
    const validatedData = validations_1.loginSchema.parse(req.body);
    const { email, password } = validatedData;
    console.log("email password ", email, password);
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        throw new errorHandler_1.AppError(401, 'Invalid email or password');
    }
    const token = generateToken(user.id);
    res.json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
            },
            token,
        },
    });
});
exports.getProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            address: true,
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError(404, 'User not found');
    }
    res.json({
        status: 'success',
        data: { user },
    });
});
exports.updateProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const validatedData = validations_1.userSchema.partial().parse(req.body);
    const { password, ...updateData } = validatedData;
    let hashedPassword;
    if (password) {
        hashedPassword = await bcryptjs_1.default.hash(password, 10);
    }
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: {
            ...updateData,
            ...(hashedPassword && { password: hashedPassword }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            address: true,
        },
    });
    res.json({
        status: 'success',
        data: { user },
    });
});
//# sourceMappingURL=userController.js.map