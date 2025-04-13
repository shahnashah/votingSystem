import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Briefcase,
  DollarSign,
} from "lucide-react";

const API_BASE_URL = "/api";

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentElectionId, setCurrentElectionId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/election/committee/elections`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
        setElections(response.data);

        if (response.data.length > 0) {
          setCurrentElectionId(response.data[0]._id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching elections:", error);
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    if (currentElectionId) {
      fetchPosts(currentElectionId);
    }
  }, [currentElectionId]);

  const fetchPosts = async (electionId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/post/${electionId}/posts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      await axios.post(
        `${API_BASE_URL}/post/${currentElectionId}/posts`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      fetchPosts(currentElectionId);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleUpdatePost = async (id, postData) => {
    try {
      await axios.put(`${API_BASE_URL}/post/${id}`, postData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      fetchPosts(currentElectionId);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`${API_BASE_URL}/post/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        fetchPosts(currentElectionId);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const formatRupees = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Post Management</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
          disabled={!currentElectionId}
        >
          <Plus size={16} />
          Create Post
        </button>
      </div>

      {elections.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-6">
          No elections found. Please create an election first.
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Election
          </label>
          <select
            value={currentElectionId}
            onChange={(e) => setCurrentElectionId(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md"
          >
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading posts...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomination Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No posts found for this election. Create posts to get
                    started.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Briefcase size={20} className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md truncate">
                        {post.description || "No description provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign size={16} className="text-green-600 mr-1" />
                        {formatRupees(post.nominationFee)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            setCurrentPost(post);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <PostFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
          title="Create New Post"
          electionId={currentElectionId}
        />
      )}

      {showEditModal && currentPost && (
        <PostFormModal
          onClose={() => setShowEditModal(false)}
          onSubmit={(data) => handleUpdatePost(currentPost._id, data)}
          title="Edit Post"
          post={currentPost}
          electionId={currentElectionId}
        />
      )}
    </div>
  );
};

const PostFormModal = ({
  onClose,
  onSubmit,
  title,
  post = null,
  electionId,
}) => {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    description: post?.description || "",
    nominationFee: post?.nominationFee || 500,
    election: post?.election || electionId,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "nominationFee" ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              placeholder="e.g., President, Treasurer, Secretary"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Describe the responsibilities and requirements for this position"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomination Fee (₹)*
            </label>
            <input
              type="number"
              name="nominationFee"
              value={formData.nominationFee}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              min="0"
              step="100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Default fee is ₹500 per post nomination
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2"
            >
              <Check size={16} />
              {post ? "Update Post" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostManagement;
