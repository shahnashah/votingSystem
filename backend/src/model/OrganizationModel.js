import mongoose from "mongoose"

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['NGO', 'Society', 'Club'],
    required: true
  },
  contactInfo: {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String }
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  committeeMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Organization = new mongoose.model("organization", OrganizationSchema)

export default Organization;