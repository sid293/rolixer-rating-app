"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { protect, authorize } from '../middleware/authMiddleware';
const adminController_1 = require("../controllers/adminController");
const userController_1 = require("../controllers/userController");
const storeController_1 = require("../controllers/storeController");
const ratingController_1 = require("../controllers/ratingController");
const router = express_1.default.Router();
// router.use(protect);
// router.use(authorize('ADMIN'));
router.get('/stats', adminController_1.getAdminStats);
router.get('/users', userController_1.getAllUsers);
router.get('/stores', storeController_1.getStores);
router.get('/ratings', ratingController_1.getAllRatings);
router.delete('/users/:id', userController_1.deleteUser);
router.post('/users/register', userController_1.register);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map