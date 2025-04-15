import express from 'express';
import { createStore, getStores, getStore, updateStore, deleteStore } from '../controllers/storeController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getStores);
router.get('/:id', getStore);

router.use(protect);
router.post('/', authorize('STORE_OWNER', 'ADMIN'), createStore);
router.put('/:id', authorize('STORE_OWNER', 'ADMIN'), updateStore);
router.delete('/:id', authorize('STORE_OWNER', 'ADMIN'), deleteStore);

export default router;