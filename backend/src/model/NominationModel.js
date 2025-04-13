import mongoose from "mongoose";

const NominationSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  agenda: { type: String },
  paymentReceipt: { type: String }, // URL to uploaded receipt
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const nominationModel = new mongoose.model("Nomination", NominationSchema);

export default nominationModel;