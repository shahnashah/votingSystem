import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

const voteModel = new mongoose.model("Vote", VoteSchema);

export default voteModel;