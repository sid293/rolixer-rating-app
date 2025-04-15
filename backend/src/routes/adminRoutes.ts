import express from 'express';
// import { protect, authorize } from '../middleware/authMiddleware';
import { getAdminStats } from '../controllers/adminController';
import { getAllUsers, deleteUser, register } from '../controllers/userController';
import { getStores } from '../controllers/storeController';
import { getAllRatings } from '../controllers/ratingController';

const router = express.Router();

// router.use(protect);
// router.use(authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/stores', getStores);
router.get('/ratings', getAllRatings);
router.delete('/users/:id', deleteUser);
router.post('/users/register', register);

export default router;