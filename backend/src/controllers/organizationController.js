// controllers/organizationController.js
import Organization from '../model/OrganizationModel.js';
import userModel from '../model/UserModel.js';
import mongoose from 'mongoose';
// Get all organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('admin', 'name email')
      .populate('committeeMembers', 'name email');
      
    res.status(200).json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get organization by ID

export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid organization ID format',
        details: 'The ID must be a valid MongoDB ObjectId'
      });
    }
    
    const organization = await Organization.findById(id)
      .populate('admin', 'name email')
      .populate('committeeMembers', 'name email');
      
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.status(200).json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new organization
export const createOrganization = async (req, res) => {
  try {
    const { name, type, contactInfo, admin, committeeMembers } = req.body;
    
    const newOrganization = new Organization({
      name,
      type, 
      contactInfo,
      admin: admin || req.user._id, // Assuming req.user is set by auth middleware
      committeeMembers: committeeMembers || []
    });
    
    const savedOrganization = await newOrganization.save();
    
    // Update committee members' roles and organization field
    if (committeeMembers && committeeMembers.length > 0) {
      await userModel.updateMany(
        { _id: { $in: committeeMembers } },
        { 
          $set: { 
            role: 'committee',
            organization: savedOrganization._id
          }
        }
      );
    }
    
    // Populate the saved organization with referenced documents
    const populatedOrg = await Organization.findById(savedOrganization._id)
      .populate('admin', 'name email')
      .populate('committeeMembers', 'name email');
    
    res.status(201).json(populatedOrg);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update organization
export const updateOrganization = async (req, res) => {
  try {
    const { name, type, contactInfo, admin, committeeMembers } = req.body;
    
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Update fields
    organization.name = name || organization.name;
    organization.type = type || organization.type;
    
    if (contactInfo) {
      organization.contactInfo = {
        ...organization.contactInfo,
        ...contactInfo
      };
    }
    
    if (admin) {
      organization.admin = admin;
    }
    
    // Only update committeeMembers if provided
    if (committeeMembers) {
      // First, keep track of previous members to check for changes
      const previousMembers = [...organization.committeeMembers];
      
      // Update committee members in organization
      organization.committeeMembers = committeeMembers;
      
      // Save organization first
      const updatedOrg = await organization.save();
      
      // Find new members (added in this update)
      const newMembers = committeeMembers.filter(
        memberId => !previousMembers.includes(memberId)
      );
      
      // Find removed members (removed in this update)
      const removedMembers = previousMembers.filter(
        memberId => !committeeMembers.includes(memberId)
      );
      
      // Update new members' roles and organization
      if (newMembers.length > 0) {
        await userModel.updateMany(
          { _id: { $in: newMembers } },
          { 
            $set: { 
              role: 'committee',
              organization: updatedOrg._id
            }
          }
        );
      }
      
      // Reset removed members to voter role if they are part of this organization
      if (removedMembers.length > 0) {
        await userModel.updateMany(
          { 
            _id: { $in: removedMembers },
            organization: updatedOrg._id
          },
          { 
            $set: { role: 'voter' },
            $unset: { organization: "" }
          }
        );
      }
      
      // Populate the updated organization with referenced documents
      const populatedOrg = await Organization.findById(updatedOrg._id)
        .populate('admin', 'name email')
        .populate('committeeMembers', 'name email');
      
      return res.status(200).json(populatedOrg);
    }
    
    // If committeeMembers not provided, just save and return
    const updatedOrg = await organization.save();
    
    // Populate the updated organization with referenced documents
    const populatedOrg = await Organization.findById(updatedOrg._id)
      .populate('admin', 'name email')
      .populate('committeeMembers', 'name email');
    
    res.status(200).json(populatedOrg);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete organization
export const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Update users associated with this organization
    await userModel.updateMany(
      { organization: organization._id },
      { $unset: { organization: "" } }
    );
    
    // Reset committee members to voter role
    await userModel.updateMany(
      { _id: { $in: organization.committeeMembers } },
      { $set: { role: 'voter' } }
    );
    
    // Remove the organization
    await organization.deleteOne();
    
    res.status(200).json({ message: 'Organization removed successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign committee members to organization
export const assignCommitteeMembers = async (req, res) => {
  try {
    const { committeeMembers } = req.body;
    
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Store previous members to track changes
    const previousMembers = [...organization.committeeMembers];
    
    // Update committee members in organization
    organization.committeeMembers = committeeMembers;
    
    // Save organization
    const updatedOrg = await organization.save();
    
    // Find new members (added in this update)
    const newMembers = committeeMembers.filter(
      memberId => !previousMembers.includes(memberId)
    );
    
    // Find removed members (removed in this update)
    const removedMembers = previousMembers.filter(
      memberId => !committeeMembers.includes(memberId)
    );
    
    // Update new members' roles and organization
    if (newMembers.length > 0) {
      await userModel.updateMany(
        { _id: { $in: newMembers } },
        { 
          $set: { 
            role: 'committee',
            organization: updatedOrg._id
          }
        }
      );
    }
    
    // Reset removed members to voter role if they are part of this organization
    if (removedMembers.length > 0) {
      await userModel.updateMany(
        { 
          _id: { $in: removedMembers },
          organization: updatedOrg._id
        },
        { 
          $set: { role: 'voter' },
          $unset: { organization: "" }
        }
      );
    }
    
    // Populate the updated organization with referenced documents
    const populatedOrg = await Organization.findById(updatedOrg._id)
      .populate('admin', 'name email')
      .populate('committeeMembers', 'name email');
    
    res.status(200).json(populatedOrg);
  } catch (error) {
    console.error('Error assigning committee members:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};