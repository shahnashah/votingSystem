import Election from "../model/ElectionModel.js";
import Organization from "../model/OrganizationModel.js";
import { generateUniqueLink } from '../utils/helpers.js';

// GET /api/committee/elections
export const getCommitteeElections = async (req, res) => {
  try {
    const elections = await Election.find({ committee: req.user._id })
      // .populate("organization")
      .sort({ createdAt: -1 });

    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: "Error fetching elections", error });
  }
};

// POST /api/committee/elections
export const createElection = async (req, res) => {
  try {
    const { title, description, votingStart, votingEnd, status } = req.body;

    const organization = req.user.organization;
    
    if (!organization) {
      return res.status(400).json({ message: "Committee must be associated with an organization" });
    }
    
    // Generate unique links
    const registrationLink = generateUniqueLink();
    const nominationLink = generateUniqueLink();
    const votingLink = generateUniqueLink();

    const newElection = await Election.create({
      title,
      description,
      votingStart,
      votingEnd,
      status,
      committee: req.user._id,
      organization,
      registrationLink,
      nominationLink,
      votingLink
    });

    res.status(201).json(newElection);
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ message: "Error creating election", error: error.message });
  }
};

// PUT /api/committee/elections/:id
export const updateElection = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Election.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating election", error });
  }
};

// DELETE /api/committee/elections/:id
export const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Election.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json({ message: "Election deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting election", error });
  }
};


// Get all elections
export const getAllElections = async (req, res) => {
  try {
    // You can add filters based on query parameters if needed
    const filter = {};
    
    // Optional: If you want to filter by organization
    if (req.query.organization) {
      filter.organization = req.query.organization;
    }
    
    // Optional: If you want to filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Fetch elections with populated references
    const elections = await Election.find(filter)
      .populate('organization', 'name') // Populate just the name of the organization
      .populate('committee', 'name email') // Populate basic committee info
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({
      success: true,
      count: elections.length,
      data: elections
    });
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching elections'
    });
  }
};
