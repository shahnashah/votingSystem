import express from 'express';
import { 
  createNomination, 
  getNominationsByElection, 
  getNominationById, 
  getNominationsByCandidate,
  approveNomination, 
  rejectNomination, 
  updateNomination, 
  deleteNomination 
} from '../controllers/nominationController.js';
import { protect } from '../middleware/authMiddleware.js';

const nominationRoutes = express.Router();

// Create a new nomination (candidates only)
nominationRoutes.post('/', protect, createNomination);

// Get all nominations for a specific election (with optional status filter)
nominationRoutes.get('/:electionId/nominations', protect, getNominationsByElection);

// Get a specific nomination
nominationRoutes.get('/:id', protect, getNominationById);

// Get all nominations for a candidate
nominationRoutes.get('/candidate/:candidateId', protect, getNominationsByCandidate);

// Approve a nomination (committee members only)
nominationRoutes.put('/:id/approve', protect, approveNomination);

// Reject a nomination (committee members only)
nominationRoutes.put('/:id/reject', protect, rejectNomination);

// Update a nomination (only the owner can update)
nominationRoutes.put('/:id', protect, updateNomination);

// Delete a nomination (owner or admin only)
nominationRoutes.delete('/:id', protect, deleteNomination);

export default nominationRoutes;