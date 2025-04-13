import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'committee', 'candidate', 'voter'],
    default: 'voter'
  },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  otpExpiry: { type: Date },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  createdAt: { type: Date, default: Date.now }
});

const userModel = mongoose.model("User", UserSchema);
export default userModel;