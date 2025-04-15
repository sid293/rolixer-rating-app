import express from 'express';
import { createRating, updateRating, deleteRating, getStoreRatings, getAllRatings } from '../controllers/ratingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getAllRatings);
router.get('/store/:storeId', getStoreRatings);

router.use(protect);
router.post('/store/:storeId', createRating);
router.put('/store/:storeId', updateRating);
router.delete('/store/:storeId', deleteRating);

export default router;