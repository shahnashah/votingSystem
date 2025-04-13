// controllers/postController.js
import Post from "../model/PostModel.js"
import Election from "../model/ElectionModel.js";
import Nomination from "../model/NominationModel.js"

// Get all posts for an election
export const getPosts = async (req, res) => {
  try {
    const electionId = req.params.electionId;
    
    // Verify the election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Fetch all posts for this election
    const posts = await Post.find({ election: electionId })
                           .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch posts', 
      error: error.message 
    });
  }
};

// Get a single post
export const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ 
      _id: req.params.id,
      committeeId: req.committee.id
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, description, nominationFee } = req.body;
    const electionId = req.params.electionId;
    
    // Verify the election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Verify the user is the committee member for this election
    if (election.committee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add posts to this election' });
    }
    
    // Create the new post
    const newPost = new Post({
      title,
      description,
      election: electionId,
      nominationFee: nominationFee || 500 // Default to 500 if not provided
    });
    
    await newPost.save();
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      message: 'Failed to create post', 
      error: error.message 
    });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, description, nominationFee } = req.body;
    
    // Find the post and populate the election field to check permissions
    const post = await Post.findById(postId).populate('election');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if the user is authorized to update this post
    if (post.election.committee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // Update the post fields
    post.title = title || post.title;
    post.description = description || post.description;
    
    // Only update nomination fee if provided
    if (nominationFee !== undefined) {
      post.nominationFee = nominationFee;
    }
    
    await post.save();
    
    res.status(200).json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      message: 'Failed to update post', 
      error: error.message 
    });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Find the post and populate the election field to check permissions
    const post = await Post.findById(postId).populate('election');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if the user is authorized to delete this post
    if (post.election.committee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    // Check if there are any nominations for this post (optional, based on your business logic)
    // This would require importing your Nomination model
    // const nominations = await Nomination.find({ post: postId });
    // if (nominations.length > 0) {
    //   return res.status(400).json({ message: 'Cannot delete post with existing nominations' });
    // }
    
    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      message: 'Failed to delete post', 
      error: error.message 
    });
  }
};