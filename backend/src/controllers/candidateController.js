import User from '../model/UserModel.js';
import Election from '../model/ElectionModel.js';
import Post from '../model/PostModel.js';
import Nomination from '../model/NominationModel.js';

// Get current user's nominations
export const getMyNominations = async (req, res) => {
  try {
    const nominations = await Nomination.find({ candidate: req.user._id })
      .populate('post')
      .populate('election')
      .sort({ createdAt: -1 });
    
    res.status(200).json(nominations);
  } catch (error) {
    console.error('Error fetching nominations:', error);
    res.status(500).json({ message: 'Failed to fetch nominations' });
  }
};

// Submit new nomination
export const submitNomination = async (req, res) => {
  try {
    const { election, post, agenda } = req.body;
    
    // Validate election and post
    const electionExists = await Election.findById(election);
    if (!electionExists) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    if (electionExists.status !== 'nomination') {
      return res.status(400).json({ message: 'This election is not in nomination phase' });
    }
    
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Payment receipt is required' });
    }
    
    // Check if user already nominated for this post in this election
    const existingNomination = await Nomination.findOne({
      candidate: req.user._id,
      post,
      election
    });
    
    if (existingNomination) {
      return res.status(400).json({ 
        message: 'You have already submitted a nomination for this post' 
      });
    }
    
    // Create new nomination
    const nomination = new Nomination({
      candidate: req.user._id,
      post,
      election,
      agenda,
      paymentReceipt: `/uploads/receipts/${req.file.filename}`,
      status: 'pending'
    });
    
    await nomination.save();
    
    // Set user role to candidate if not already
    if (req.user.role !== 'candidate') {
      await User.findByIdAndUpdate(req.user._id, { role: 'candidate' });
    }
    
    res.status(201).json({ 
      message: 'Nomination submitted successfully', 
      nomination 
    });
  } catch (error) {
    console.error('Error submitting nomination:', error);
    res.status(500).json({ message: 'Failed to submit nomination' });
  }
};

// Update nomination agenda
export const updateNominationAgenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { agenda } = req.body;
    
    if (!agenda) {
      return res.status(400).json({ message: 'Agenda is required' });
    }
    
    const nomination = await Nomination.findById(id);
    
    if (!nomination) {
      return res.status(404).json({ message: 'Nomination not found' });
    }
    
    // Check if user owns this nomination
    if (nomination.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Check if nomination can be updated
    if (nomination.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot update rejected nomination' });
    }
    
    nomination.agenda = agenda;
    await nomination.save();
    
    res.status(200).json({ 
      message: 'Agenda updated successfully', 
      nomination 
    });
  } catch (error) {
    console.error('Error updating agenda:', error);
    res.status(500).json({ message: 'Failed to update agenda' });
  }
};

// Candidate registration endpoint
export const registerCandidate = async (req, res) => {
  try {
    const { name, email, phone, password, organizationId, electionId } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password || !organizationId || !electionId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Check if organization and election exist
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Generate OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getHours() + 1); // OTP valid for 1 hour
    
    // Create new user with candidate role
    const user = new User({
      name,
      email,
      phone,
      password, // This should be hashed in a real implementation
      role: 'candidate',
      organization: organizationId,
      verificationOTP: otp,
      otpExpiry
    });
    
    await user.save();
    
    // In real implementation, send OTP via email or SMS
    
    res.status(201).json({ 
      message: 'Registration successful. Please verify your account with the OTP sent to your email/phone.',
      userId: user._id 
    });
  } catch (error) {
    console.error('Error in candidate registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Verify OTP endpoint
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }
    
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    res.status(200).json({ 
      message: 'Account verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};