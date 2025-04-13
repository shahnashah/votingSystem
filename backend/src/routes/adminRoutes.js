import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateUserRole,
  deleteUser,
  getUserProfile,
} from '../controllers/user.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const adminRoutes = express.Router();
adminRoutes.get('/profile', protect, getUserProfile);

adminRoutes.get('/', protect, isAdmin, getAllUsers);
adminRoutes.get('/:id', protect, isAdmin, getUserById);
adminRoutes.put('/:id', protect, isAdmin, updateUserProfile);
adminRoutes.put('/:id/role', protect, isAdmin, updateUserRole);
adminRoutes.delete('/:id', protect, isAdmin, deleteUser);

export default adminRoutes;