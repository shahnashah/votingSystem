import mongoose from "mongoose";

const ElectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization', required: true },
  committee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votingStart: { type: Date, required: true },
  votingEnd: { type: Date, required: true },
  registrationLink: { type: String, unique: true },
  nominationLink: { type: String, unique: true },
  votingLink: { type: String, unique: true },
  status: { 
    type: String, 
    enum: ['draft', 'nomination', 'voting', 'completed'],
    default: 'draft'
  },
  createdAt: { type: Date, default: Date.now }
});

const electionModel = new mongoose.model("Election", ElectionSchema)

export default electionModel;