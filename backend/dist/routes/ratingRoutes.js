"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratingController_1 = require("../controllers/ratingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/', ratingController_1.getAllRatings);
router.get('/store/:storeId', ratingController_1.getStoreRatings);
router.use(authMiddleware_1.protect);
router.post('/store/:storeId', ratingController_1.createRating);
router.put('/store/:storeId', ratingController_1.updateRating);
router.delete('/store/:storeId', ratingController_1.deleteRating);
exports.default = router;
//# sourceMappingURL=ratingRoutes.js.map