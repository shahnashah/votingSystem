import express from 'express';
import multer from 'multer';
import { configureStorage } from '../config/multerConfig.js';
import { 
  getMyNominations, 
  submitNomination, 
  updateNominationAgenda, 
  registerCandidate, 
  verifyOTP 
} from '../controllers/candidateController.js';
import { protect } from '../middleware/authMiddleware.js';

const candidateRoutes = express.Router();
const upload = multer({ 
  storage: configureStorage('uploads/receipts', 'receipt'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, .png and .pdf formats are allowed!'));
    }
  }
});

// Get current user's nominations
candidateRoutes.get('/my-nominations', protect, getMyNominations);

// Submit new nomination
candidateRoutes.post('/submit', protect, upload.single('paymentReceipt'), submitNomination);

// Update nomination agenda
candidateRoutes.put('/:id/update-agenda', protect, updateNominationAgenda);

// Candidate registration endpoint
candidateRoutes.post('/register', registerCandidate);

// Verify OTP endpoint
candidateRoutes.post('/verify-otp', verifyOTP);

export default candidateRoutes;