import express from "express";
import {
  getPosts, getPost, createPost, updatePost, deletePost
} from "../controllers/postController.js";
import { protect } from '../middleware/authMiddleware.js';

const postRoutes = express.Router();

postRoutes.get('/:electionId/posts', protect, getPosts);
postRoutes.post('/:electionId/posts', protect, createPost);
postRoutes.put('/:id', protect, updatePost);
postRoutes.delete('/:id', protect, deletePost);

export default postRoutes;