"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storeController_1 = require("../controllers/storeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/', storeController_1.getStores);
router.get('/:id', storeController_1.getStore);
router.use(authMiddleware_1.protect);
router.post('/', (0, authMiddleware_1.authorize)('STORE_OWNER', 'ADMIN'), storeController_1.createStore);
router.put('/:id', (0, authMiddleware_1.authorize)('STORE_OWNER', 'ADMIN'), storeController_1.updateStore);
router.delete('/:id', (0, authMiddleware_1.authorize)('STORE_OWNER', 'ADMIN'), storeController_1.deleteStore);
exports.default = router;
//# sourceMappingURL=storeRoutes.js.map