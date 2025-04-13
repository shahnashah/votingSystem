import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  FileText,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Upload,
  RefreshCw,
} from "lucide-react";

const CandidateDashboard = () => {
  const [user, setUser] = useState(null);
  const [nominations, setNominations] = useState([]);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("nominations");
  const [editingNomination, setEditingNomination] = useState(null);

  // For nomination form
  const [selectedElection, setSelectedElection] = useState("");
  const [selectedPost, setSelectedPost] = useState("");
  const [agenda, setAgenda] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Fetch user data, nominations, and available posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get current user
        const userResponse = await axios.get("/api/admin/profile", {
          withCredentials: true,
        });

        setUser(userResponse.data.data);

        // Get available elections
        const electionsResponse = await axios.get("/api/election/elections", {
          withCredentials: true,
        });
        setElections(electionsResponse.data.data);

        // Get user's nominations
        const nominationsResponse = await axios.get(
          `/api/nomination/${userResponse.data.data.id}`,
          {
            withCredentials: true,
          }
        );
        setNominations(nominationsResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Fetch posts for selected election
  useEffect(() => {
    if (selectedElection) {
      const fetchPosts = async () => {
        try {
          const postsResponse = await axios.get(
            `/api/posts/election/${selectedElection}`
          );
          setAvailablePosts(postsResponse.data);
        } catch (err) {
          console.error("Failed to fetch posts:", err);
        }
      };

      fetchPosts();
    } else {
      setAvailablePosts([]);
    }
  }, [selectedElection]);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentReceipt(file);

      // Create preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files like PDFs
        setFilePreview(null);
      }
    }
  };

  // Clear file
  const clearFile = () => {
    setPaymentReceipt(null);
    setFilePreview(null);
  };

  // Submit nomination
  const handleNominationSubmit = async (e) => {
    e.preventDefault();

    if (!selectedElection || !selectedPost || !agenda || !paymentReceipt) {
      setError("Please fill all fields and upload payment receipt");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("election", selectedElection);
      formData.append("post", selectedPost);
      formData.append("agenda", agenda);
      formData.append("paymentReceipt", paymentReceipt);

      await axios.post("/api/nominations/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      // Refresh nominations after submission
      const nominationsResponse = await axios.get(
        "/api/nominations/my-nominations",
        {
          withCredentials: true,
        }
      );
      setNominations(nominationsResponse.data);

      // Reset form
      setSelectedElection("");
      setSelectedPost("");
      setAgenda("");
      setPaymentReceipt(null);
      setFilePreview(null);

      setSuccess("Nomination submitted successfully!");
      setActiveTab("nominations");

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError("Failed to submit nomination. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a nomination
  const startEditAgenda = (nomination) => {
    setEditingNomination(nomination._id);
  };

  // Cancel editing
  const cancelEditAgenda = () => {
    setEditingNomination(null);
  };

  // Update nomination agenda
  const handleUpdateAgenda = async (nominationId, newAgenda) => {
    try {
      await axios.put(
        `/api/nominations/${nominationId}/update-agenda`,
        {
          agenda: newAgenda,
        },
        { withCredentials: true }
      );

      // Update local state
      setNominations(
        nominations.map((nom) =>
          nom._id === nominationId ? { ...nom, agenda: newAgenda } : nom
        )
      );

      setSuccess("Agenda updated successfully!");
      setEditingNomination(null);

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError("Failed to update agenda. Please try again.");
      console.error(err);
    }
  };

  // Go to voting portal
  const goToVotingPortal = () => {
    navigate("/voting-portal");
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: <Check size={14} className="mr-1" />,
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: <X size={14} className="mr-1" />,
        };
      default:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: <AlertTriangle size={14} className="mr-1" />,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Portal</h1>
          {user && (
            <div className="mt-2 text-gray-600">Welcome back, {user.name}</div>
          )}
        </div>

        {/* Alert messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <div className="flex-shrink-0">
              <X size={20} className="text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                className="mt-1 text-xs text-red-500 hover:text-red-700"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
            <div className="flex-shrink-0">
              <Check size={20} className="text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
              <button
                className="mt-1 text-xs text-green-500 hover:text-green-700"
                onClick={() => setSuccess(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* User profile card */}
        {user && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span>{" "}
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <button
                onClick={goToVotingPortal}
                className="mt-4 sm:mt-0 flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Go to Voting Portal
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("nominations")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "nominations"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Nominations
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "submit"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Submit New Nomination
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {/* My Nominations Tab */}
          {activeTab === "nominations" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Nominations
                </h2>
                <span className="text-sm text-gray-500">
                  {nominations.length}{" "}
                  {nominations.length === 1 ? "nomination" : "nominations"}
                </span>
              </div>

              {nominations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                    <FileText size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No nominations yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't submitted any nominations yet.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab("submit")}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                      Submit a nomination
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {nominations.map((nomination) => {
                    const statusBadge = getStatusBadge(nomination.status);
                    return (
                      <div
                        key={nomination._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {nomination.post.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {nomination.election.title}
                              </p>
                            </div>
                            <div className="mt-2 sm:mt-0">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                              >
                                {statusBadge.icon}
                                {nomination.status.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {nomination.status === "rejected" && (
                            <div className="mt-2 mb-4 p-3 bg-red-50 rounded-md text-sm text-red-700">
                              <p className="font-medium">Rejection Reason:</p>
                              <p>
                                {nomination.rejectionReason ||
                                  "No reason provided"}
                              </p>
                            </div>
                          )}

                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              My Agenda:
                            </h4>
                            {editingNomination === nomination._id ? (
                              <div>
                                <textarea
                                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                  value={nomination.agenda}
                                  onChange={(e) => {
                                    const updatedNominations = [...nominations];
                                    const index = updatedNominations.findIndex(
                                      (n) => n._id === nomination._id
                                    );
                                    updatedNominations[index].agenda =
                                      e.target.value;
                                    setNominations(updatedNominations);
                                  }}
                                  rows="4"
                                  disabled={nomination.status === "rejected"}
                                />
                                <div className="mt-3 flex space-x-3">
                                  <button
                                    onClick={() =>
                                      handleUpdateAgenda(
                                        nomination._id,
                                        nomination.agenda
                                      )
                                    }
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled={nomination.status === "rejected"}
                                  >
                                    <Check size={16} className="mr-1" />
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={cancelEditAgenda}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <X size={16} className="mr-1" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">
                                  {nomination.agenda || "No agenda provided"}
                                </div>
                                {nomination.status !== "rejected" && (
                                  <button
                                    onClick={() => startEditAgenda(nomination)}
                                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <RefreshCw size={14} className="mr-1" />
                                    Edit Agenda
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit New Nomination Tab */}
          {activeTab === "submit" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Submit New Nomination
              </h2>

              <form onSubmit={handleNominationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Election *
                    </label>
                    <select
                      value={selectedElection}
                      onChange={(e) => setSelectedElection(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Select an election</option>
                      {elections.map((election) => (
                        <option key={election._id} value={election._id}>
                          {election.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Post *
                    </label>
                    <select
                      value={selectedPost}
                      onChange={(e) => setSelectedPost(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                      disabled={!selectedElection}
                    >
                      <option value="">Select a post</option>
                      {availablePosts.map((post) => (
                        <option key={post._id} value={post._id}>
                          {post.title} (Fee: ₹{post.nominationFee})
                        </option>
                      ))}
                    </select>
                    {!selectedElection && (
                      <p className="mt-1 text-xs text-gray-500">
                        Please select an election first
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Agenda *
                  </label>
                  <textarea
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows="5"
                    placeholder="Share your campaign promises and agenda..."
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Clearly articulate your goals and plans if elected to this
                    position
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Receipt *
                  </label>

                  {!paymentReceipt ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB, or PDF
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center p-4 border border-gray-300 rounded-md">
                      {filePreview ? (
                        <div className="mr-4 flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={filePreview}
                            alt="Receipt preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="mr-4 flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {paymentReceipt.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(paymentReceipt.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={clearFile}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a scanned copy or photo of your payment receipt
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("nominations")}
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit Nomination"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
