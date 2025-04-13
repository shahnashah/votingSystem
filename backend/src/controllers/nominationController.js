import Nomination from '../model/NominationModel.js';
import Election from '../model/ElectionModel.js';
import Post from '../model/PostModel.js';

// Create a new nomination
export const createNomination = async (req, res) => {
  try {
    const { candidate, post, election, agenda, paymentReceipt } = req.body;
    
    // Validate if the election exists and is in nomination phase
    const electionDoc = await Election.findById(election);
    if (!electionDoc) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    if (electionDoc.status !== 'nomination') {
      return res.status(400).json({ message: "Nominations are not open for this election" });
    }
    
    // Validate if the post exists and belongs to the election
    const postDoc = await Post.findById(post);
    if (!postDoc || postDoc.election.toString() !== election) {
      return res.status(404).json({ message: "Post not found or doesn't belong to this election" });
    }
    
    // Check if the user has already applied for this post in this election
    const existingNomination = await Nomination.findOne({ 
      candidate, 
      post, 
      election 
    });
    
    if (existingNomination) {
      return res.status(400).json({ message: "You have already applied for this post" });
    }
    
    const newNomination = new Nomination({
      candidate,
      post,
      election,
      agenda,
      paymentReceipt,
      status: 'pending'
    });
    
    const savedNomination = await newNomination.save();
    
    res.status(201).json(savedNomination);
  } catch (error) {
    console.error("Error creating nomination:", error);
    res.status(500).json({ message: "Failed to create nomination", error: error.message });
  }
};

// Get all nominations for an election (with optional status filter)
export const getNominationsByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { status } = req.query;
    
    const filter = { election: electionId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const nominations = await Nomination.find(filter)
      .populate('candidate', 'name email')
      .populate('post', 'title description')
      .populate('election', 'title');
    
    res.status(200).json(nominations);
  } catch (error) {
    console.error("Error fetching nominations:", error);
    res.status(500).json({ message: "Failed to fetch nominations", error: error.message });
  }
};

// Get a specific nomination by ID
export const getNominationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nomination = await Nomination.findById(id)
      .populate('candidate', 'name email')
      .populate('post', 'title description')
      .populate('election', 'title');
    
    if (!nomination) {
      return res.status(404).json({ message: "Nomination not found" });
    }
    
    res.status(200).json(nomination);
  } catch (error) {
    console.error("Error fetching nomination:", error);
    res.status(500).json({ message: "Failed to fetch nomination", error: error.message });
  }
};

// Get nominations by candidate
export const getNominationsByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const nominations = await Nomination.find({ candidate: candidateId })
      .populate('post', 'title description')
      .populate('election', 'title status');
    
    res.status(200).json(nominations);
  } catch (error) {
    console.error("Error fetching candidate nominations:", error);
    res.status(500).json({ message: "Failed to fetch nominations", error: error.message });
  }
};

// Update nomination status to approved
export const approveNomination = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nomination = await Nomination.findById(id);
    if (!nomination) {
      return res.status(404).json({ message: "Nomination not found" });
    }
    
    // Check if election is still in nomination phase
    const election = await Election.findById(nomination.election);
    if (election.status !== 'nomination') {
      return res.status(400).json({ message: "Nomination phase has ended" });
    }
    
    nomination.status = 'approved';
    nomination.rejectionReason = undefined;
    
    const updatedNomination = await nomination.save();
    
    res.status(200).json(updatedNomination);
  } catch (error) {
    console.error("Error approving nomination:", error);
    res.status(500).json({ message: "Failed to approve nomination", error: error.message });
  }
};

// Update nomination status to rejected
export const rejectNomination = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }
    
    const nomination = await Nomination.findById(id);
    if (!nomination) {
      return res.status(404).json({ message: "Nomination not found" });
    }
    
    // Check if election is still in nomination phase
    const election = await Election.findById(nomination.election);
    if (election.status !== 'nomination') {
      return res.status(400).json({ message: "Nomination phase has ended" });
    }
    
    nomination.status = 'rejected';
    nomination.rejectionReason = rejectionReason;
    
    const updatedNomination = await nomination.save();
    
    res.status(200).json(updatedNomination);
  } catch (error) {
    console.error("Error rejecting nomination:", error);
    res.status(500).json({ message: "Failed to reject nomination", error: error.message });
  }
};

// Update a nomination
export const updateNomination = async (req, res) => {
  try {
    const { id } = req.params;
    const { agenda, paymentReceipt } = req.body;
    
    const nomination = await Nomination.findById(id);
    if (!nomination) {
      return res.status(404).json({ message: "Nomination not found" });
    }
    
    // Check if user is the owner of the nomination
    if (nomination.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this nomination" });
    }
    
    // Check if election is still in nomination phase
    const election = await Election.findById(nomination.election);
    if (election.status !== 'nomination') {
      return res.status(400).json({ message: "Nomination phase has ended" });
    }
    
    // Only allow updates to pending nominations
    if (nomination.status !== 'pending') {
      return res.status(400).json({ message: "Cannot update nomination that has been processed" });
    }
    
    if (agenda) nomination.agenda = agenda;
    if (paymentReceipt) nomination.paymentReceipt = paymentReceipt;
    
    const updatedNomination = await nomination.save();
    
    res.status(200).json(updatedNomination);
  } catch (error) {
    console.error("Error updating nomination:", error);
    res.status(500).json({ message: "Failed to update nomination", error: error.message });
  }
};

// Delete a nomination
export const deleteNomination = async (req, res) => {
  try {
    const { id } = req.params;
    
    const nomination = await Nomination.findById(id);
    if (!nomination) {
      return res.status(404).json({ message: "Nomination not found" });
    }
    
    // Check if user is the owner of the nomination or an admin
    if (nomination.candidate.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You are not authorized to delete this nomination" });
    }
    
    // Check if election is still in nomination phase
    const election = await Election.findById(nomination.election);
    if (election.status !== 'nomination') {
      return res.status(400).json({ message: "Nomination phase has ended" });
    }
    
    await Nomination.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Nomination deleted successfully" });
  } catch (error) {
    console.error("Error deleting nomination:", error);
    res.status(500).json({ message: "Failed to delete nomination", error: error.message });
  }
};