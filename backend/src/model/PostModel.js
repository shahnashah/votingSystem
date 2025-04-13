import mongoose from "mongoose"

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  nominationFee: { type: Number, default: 500 }, // In rupees
  createdAt: { type: Date, default: Date.now }
});

const postModel = new mongoose.model("Post", PostSchema);

export default postModel;