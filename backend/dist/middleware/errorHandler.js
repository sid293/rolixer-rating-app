"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
// import { Prisma } from '@prisma/client';
const library_1 = require("@prisma/client/runtime/library");
class AppError extends Error {
    statusCode;
    message;
    errors;
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            errors: err.errors,
        });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: err.errors,
        });
    }
    if (err instanceof library_1.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                status: 'error',
                message: 'A unique constraint violation occurred',
            });
        }
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map