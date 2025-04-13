import express from 'express';
import { 
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  assignCommitteeMembers
} from '../controllers/organizationController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const organizationRoutes = express.Router();

// Public routes
organizationRoutes.get('/', getAllOrganizations);
organizationRoutes.get('/:id', getOrganizationById);

// Protected routes (admin only)
organizationRoutes.post('/', protect, isAdmin, createOrganization);
organizationRoutes.put('/:id', protect, isAdmin, updateOrganization);
organizationRoutes.delete('/:id', protect, isAdmin, deleteOrganization);
organizationRoutes.put('/:id/committee', protect, isAdmin, assignCommitteeMembers);

export default organizationRoutes;