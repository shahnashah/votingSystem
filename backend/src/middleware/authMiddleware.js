// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import userModel from '../model/UserModel.js';

// Protect routes - verify token
export const protect = async (req, res, next) => {

  const token = req.cookies.token;
  
    try {
      console.log(token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await userModel.findById(decoded.id).select('-password');
      console.log(req.user.name)

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// Admin middleware
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Committee middleware
export const isCommittee = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'committee')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a committee member');
  }
};