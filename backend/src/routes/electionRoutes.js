import express from "express";
import {
  getCommitteeElections,
  createElection,
  updateElection,
  deleteElection,
  getAllElections 
} from "../controllers/electionController.js";
import { protect } from '../middleware/authMiddleware.js';

const electionRoutes = express.Router();


  electionRoutes.get("/elections", protect, getAllElections)
  electionRoutes.get("/committee/elections", protect, getCommitteeElections)
  electionRoutes.post("/committee/elections", protect, createElection);

  electionRoutes.put("/committee/elections/:id", protect, updateElection)
  electionRoutes.delete("/committee/elections/:id", protect, deleteElection);

export default electionRoutes;
