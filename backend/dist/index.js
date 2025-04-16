"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { ErrorRequestHandler } from 'express';
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const ratingRoutes_1 = __importDefault(require("./routes/ratingRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://rolixer-rating-appfr.vercel.app/login"]
}));
app.use(express_1.default.json());
// Routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/stores', storeRoutes_1.default);
app.use('/api/ratings', ratingRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Error Handler
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map