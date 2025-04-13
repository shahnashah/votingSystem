import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const VoterDashboard = () => {
  const [user, setUser] = useState(null);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [posts, setPosts] = useState([]);
  const [candidates, setCandidates] = useState({});
  const [votes, setVotes] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activePostIndex, setActivePostIndex] = useState(0);

  const navigate = useNavigate();

  // Fetch user data and available elections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get current user
        const userResponse = await axios.get("/api/admin/profile", {
          withCredentials: true,
        });
        setUser(userResponse.data);

        // Get available elections for voting
        const electionsResponse = await axios.get("/api/elections/active", {
          withCredentials: true,
        });
        setElections(electionsResponse.data);

        setLoading(false);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Fetch posts and candidates when an election is selected
  useEffect(() => {
    if (selectedElection) {
      const fetchElectionData = async () => {
        try {
          setLoading(true);

          // Get posts for this election
          const postsResponse = await axios.get(
            `/api/posts/election/${selectedElection._id}`
          );
          setPosts(postsResponse.data);

          // Get candidates for each post
          const candidatesObj = {};

          for (const post of postsResponse.data) {
            const candidatesResponse = await axios.get(
              `/api/nominations/approved/post/${post._id}`
            );
            candidatesObj[post._id] = candidatesResponse.data;
          }

          setCandidates(candidatesObj);

          // Initialize votes object
          const initialVotes = {};
          postsResponse.data.forEach((post) => {
            initialVotes[post._id] = null;
          });
          setVotes(initialVotes);

          setLoading(false);
        } catch (err) {
          setError("Failed to load election data. Please try again.");
          setLoading(false);
          console.error(err);
        }
      };

      fetchElectionData();
    }
  }, [selectedElection]);

  // Handle election selection
  const handleElectionSelect = (election) => {
    setSelectedElection(election);
    setPreviewMode(false);
    setVotes({});
    setActivePostIndex(0);
  };

  // Handle vote selection
  const handleVoteSelect = (postId, candidateId) => {
    if (previewMode) return;

    setVotes((prev) => ({
      ...prev,
      [postId]: candidateId,
    }));
  };

  // Navigate to next post
  const handleNextPost = () => {
    if (activePostIndex < posts.length - 1) {
      setActivePostIndex(activePostIndex + 1);
    } else {
      handlePreview();
    }
  };

  // Navigate to previous post
  const handlePreviousPost = () => {
    if (activePostIndex > 0) {
      setActivePostIndex(activePostIndex - 1);
    }
  };

  // Enter preview mode
  const handlePreview = () => {
    // Check if all posts have votes
    const allVotesCast = posts.every((post) => votes[post._id] !== null);

    if (!allVotesCast) {
      setError(
        "Please select a candidate for each post before previewing your ballot."
      );
      return;
    }

    setPreviewMode(true);
    setError(null);
  };

  // Exit preview mode
  const handleEditBallot = () => {
    setPreviewMode(false);
  };

  // Submit votes
  const handleSubmitVotes = async () => {
    try {
      // Prepare votes data
      const votesData = Object.entries(votes).map(([postId, candidateId]) => ({
        post: postId,
        candidate: candidateId,
        election: selectedElection._id,
      }));

      // Submit votes
      await axios.post(
        "/api/votes/cast-votes",
        {
          votes: votesData,
        },
        { withCredentials: true }
      );

      // Reset state
      setVotes({});
      setSelectedElection(null);
      setPreviewMode(false);

      setSuccessMessage("Your votes have been successfully recorded!");

      // Refresh elections after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        window.location.reload();
      }, 3000);
    } catch (err) {
      setError("Failed to submit votes. Please try again.");
      console.error(err);
    }
  };

  // Calculate remaining time for election
  const getRemainingTime = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Voting closed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    if (!posts.length) return 0;

    const votedCount = Object.values(votes).filter(
      (vote) => vote !== null
    ).length;
    return Math.round((votedCount / posts.length) * 100);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !selectedElection) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading voter portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Banners */}
      {error && (
        <div className="fixed top-4 left-0 right-0 mx-auto max-w-md z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
          <button
            className="ml-auto text-red-500 hover:text-red-700"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 left-0 right-0 mx-auto max-w-md z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Voter Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Cast your votes securely in active elections
          </p>
        </header>

        {user && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Welcome, {user.name}
              </h2>
            </div>
            <div className="p-4 md:p-6 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <span className="material-icons">email</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <span className="material-icons">phone</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-800">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedElection ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Available Elections
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Select an election to cast your vote
              </p>
            </div>

            <div className="p-4 md:p-6">
              {elections.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-700 font-medium">
                    No Active Elections
                  </h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    There are no active elections available for voting at this
                    moment. Please check back later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {elections.map((election) => {
                    const isActive = new Date(election.votingEnd) > new Date();

                    return (
                      <div
                        key={election._id}
                        className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                          isActive
                            ? "border-gray-200"
                            : "border-gray-200 opacity-75"
                        }`}
                      >
                        <div className="p-6">
                          <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                            {election.title}
                          </h3>

                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              {formatDate(election.votingStart)} -{" "}
                              {formatDate(election.votingEnd)}
                            </span>
                          </div>

                          <p className="text-gray-600 mt-3 line-clamp-2">
                            {election.description}
                          </p>

                          <div className="flex items-center justify-between mt-6">
                            <span
                              className={`flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                                isActive
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {getRemainingTime(election.votingEnd)}
                            </span>

                            {isActive && (
                              <button
                                onClick={() => handleElectionSelect(election)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                              >
                                Vote Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <button
                onClick={() => setSelectedElection(null)}
                className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Elections
              </button>

              <div className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md">
                <Clock className="w-4 h-4 mr-1.5" />
                {getRemainingTime(selectedElection.votingEnd)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                  {selectedElection.title}
                </h2>
                <p className="text-blue-100 mt-1 line-clamp-2">
                  {selectedElection.description}
                </p>
              </div>

              {previewMode && (
                <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex items-start">
                  <Eye className="w-5 h-5 mr-2 text-yellow-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Ballot Preview Mode
                    </p>
                    <p className="text-sm text-yellow-700">
                      Please review your selections carefully before final
                      submission.
                    </p>
                  </div>
                </div>
              )}

              {!previewMode && getProgressPercentage() < 100 && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between mb-2 text-sm font-medium">
                    <span className="text-gray-600">
                      Ballot progress ({getProgressPercentage()}%)
                    </span>
                    <span className="text-blue-600">
                      {Object.values(votes).filter((v) => v !== null).length} of{" "}
                      {posts.length} posts
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading candidates...</p>
              </div>
            ) : (
              <>
                {!previewMode ? (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Post navigation tabs */}
                    <div className="border-b border-gray-200 overflow-x-auto">
                      <div className="flex min-w-max">
                        {posts.map((post, index) => (
                          <button
                            key={post._id}
                            onClick={() => setActivePostIndex(index)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                              activePostIndex === index
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            } ${
                              votes[post._id]
                                ? "after:content-['✓'] after:ml-1 after:text-green-500"
                                : ""
                            }`}
                          >
                            {post.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active post content */}
                    <div className="p-6">
                      {posts.length > 0 && (
                        <div>
                          <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {posts[activePostIndex].title}
                            </h3>
                            <p className="text-gray-600 mt-2">
                              {posts[activePostIndex].description}
                            </p>
                          </div>

                          {candidates[posts[activePostIndex]._id] &&
                          candidates[posts[activePostIndex]._id].length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                              {candidates[posts[activePostIndex]._id].map(
                                (nomination) => (
                                  <div
                                    key={nomination._id}
                                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                                      votes[posts[activePostIndex]._id] ===
                                      nomination.candidate._id
                                        ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                                        : "hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                                    onClick={() =>
                                      handleVoteSelect(
                                        posts[activePostIndex]._id,
                                        nomination.candidate._id
                                      )
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-800">
                                        {nomination.candidate.name}
                                      </h4>

                                      <div className="flex items-center">
                                        <div
                                          className={`w-5 h-5 rounded-full ${
                                            votes[
                                              posts[activePostIndex]._id
                                            ] === nomination.candidate._id
                                              ? "bg-green-500 text-white flex items-center justify-center"
                                              : "border-2 border-gray-300"
                                          }`}
                                        >
                                          {votes[posts[activePostIndex]._id] ===
                                            nomination.candidate._id && (
                                            <Check className="w-3 h-3" />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-4">
                                      <p className="text-sm font-medium text-gray-600">
                                        Agenda:
                                      </p>
                                      <p className="mt-1 text-gray-700 text-sm">
                                        {nomination.agenda}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-md">
                              <p className="text-gray-600">
                                No candidates available for this post.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between p-4 border-t border-gray-200">
                      <button
                        onClick={handlePreviousPost}
                        disabled={activePostIndex === 0}
                        className={`px-4 py-2 rounded-md font-medium ${
                          activePostIndex === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Previous
                      </button>

                      <button
                        onClick={handleNextPost}
                        className={`px-4 py-2 rounded-md font-medium ${
                          activePostIndex === posts.length - 1
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {activePostIndex === posts.length - 1
                          ? "Preview Ballot"
                          : "Next"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Preview mode */
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-semibold">Ballot Summary</h3>
                      <p className="text-gray-600 mt-1">
                        Please review your selections below before submitting
                        your final vote.
                      </p>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {posts.map((post) => {
                        const selectedCandidate = candidates[post._id]?.find(
                          (nom) => nom.candidate._id === votes[post._id]
                        );

                        return (
                          <div key={post._id} className="p-4 md:p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  {post.title}
                                </h4>
                                {selectedCandidate && (
                                  <div className="mt-2 bg-blue-50 text-blue-700 inline-flex items-center px-3 py-1 rounded-md text-sm">
                                    <Check className="w-4 h-4 mr-1" />
                                    {selectedCandidate.candidate.name}
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  setPreviewMode(false);
                                  const index = posts.findIndex(
                                    (p) => p._id === post._id
                                  );
                                  setActivePostIndex(index);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={handleEditBallot}
                        className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
                      >
                        Edit Ballot
                      </button>
                      <button
                        onClick={handleSubmitVotes}
                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                      >
                        Confirm & Submit
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterDashboard;
