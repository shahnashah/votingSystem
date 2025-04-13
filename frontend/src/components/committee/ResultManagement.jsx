import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  CheckCircle,
  Download,
  Eye,
  Globe,
  Trophy,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Info,
} from "lucide-react";

const API_BASE_URL = "/api";

const ResultsManagement = () => {
  const [elections, setElections] = useState([]);
  const [currentElectionId, setCurrentElectionId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishLoading, setPublishLoading] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (currentElectionId) {
      fetchResults(currentElectionId);
    }
  }, [currentElectionId]);

  const fetchElections = async () => {
    try {
      setLoading(true);
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

  const fetchResults = async (electionId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/committee/elections/${electionId}/results`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setResults(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching results:", error);
      setLoading(false);
    }
  };

  const handlePublishResults = async () => {
    try {
      setPublishLoading(true);
      await axios.post(
        `${API_BASE_URL}/committee/elections/${currentElectionId}/publish-results`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      // Update the election in the elections array
      const updatedElections = elections.map((election) =>
        election._id === currentElectionId
          ? { ...election, resultsPublished: true }
          : election
      );
      setElections(updatedElections);

      setPublishLoading(false);
      setShowConfirmPublish(false);
    } catch (error) {
      console.error("Error publishing results:", error);
      setPublishLoading(false);
    }
  };

  const handleDownloadResults = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/committee/elections/${currentElectionId}/results/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Find the current election title for the filename
      const election = elections.find((e) => e._id === currentElectionId);
      const filename = election
        ? `${election.title.replace(/\s+/g, "_")}_Results.csv`
        : "election_results.csv";

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading results:", error);
    }
  };

  const calculateWinner = (candidates) => {
    if (!candidates || candidates.length === 0) return null;

    let winner = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      if (candidates[i].voteCount > winner.voteCount) {
        winner = candidates[i];
      }
    }

    return winner;
  };

  const getVotePercentage = (count, total) => {
    if (total === 0) return "0%";
    return `${Math.round((count / total) * 100)}%`;
  };

  const toggleExpandPost = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
    }
  };

  const getCurrentElection = () => {
    return elections.find((election) => election._id === currentElectionId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Election Results</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleDownloadResults}
            disabled={loading || !results.length}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            Download CSV
          </button>

          {getCurrentElection() && !getCurrentElection()?.resultsPublished && (
            <button
              onClick={() => setShowConfirmPublish(true)}
              disabled={loading || !results.length}
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              <Globe size={16} />
              Publish Results
            </button>
          )}

          {getCurrentElection() && getCurrentElection()?.resultsPublished && (
            <button
              disabled
              className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md flex items-center gap-2 cursor-not-allowed"
            >
              <CheckCircle size={16} />
              Published
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Election
        </label>
        <select
          value={currentElectionId}
          onChange={(e) => setCurrentElectionId(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
        >
          {elections.map((election) => (
            <option key={election._id} value={election._id}>
              {election.title} {election.resultsPublished ? "(Published)" : ""}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
          <p>Loading election results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          No results available for this election. Make sure the voting period
          has ended.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <BarChart3 size={20} className="text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold">Vote Summary</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Posts</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Total Candidates</p>
                <p className="text-2xl font-bold">
                  {results.reduce(
                    (acc, post) => acc + post.candidates.length,
                    0
                  )}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Total Votes Cast</p>
                <p className="text-2xl font-bold">
                  {results.reduce(
                    (acc, post) =>
                      acc +
                      post.candidates.reduce(
                        (sum, candidate) => sum + candidate.voteCount,
                        0
                      ),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          {results.map((post) => {
            const winner = calculateWinner(post.candidates);
            const totalVotes = post.candidates.reduce(
              (sum, candidate) => sum + candidate.voteCount,
              0
            );
            const isExpanded = expandedPost === post._id;

            return (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpandPost(post._id)}
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {post.candidates.length} candidates • {totalVotes} total
                      votes
                    </p>
                  </div>
                  <div className="flex items-center">
                    {winner && (
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mr-3">
                        <Trophy size={14} className="mr-1" />
                        Winner: {winner.name}
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Votes
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...post.candidates]
                          .sort((a, b) => b.voteCount - a.voteCount)
                          .map((candidate, index) => (
                            <tr
                              key={candidate._id}
                              className={
                                winner?._id === candidate._id
                                  ? "bg-yellow-50"
                                  : ""
                              }
                            >
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-gray-600" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {candidate.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {candidate.email}
                                    </div>
                                  </div>
                                  {winner?._id === candidate._id && (
                                    <div className="ml-2">
                                      <Trophy
                                        size={16}
                                        className="text-yellow-500"
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {candidate.voteCount}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                  <div
                                    className={`h-2 rounded-full ${
                                      winner?._id === candidate._id
                                        ? "bg-yellow-500"
                                        : "bg-blue-500"
                                    }`}
                                    style={{
                                      width: getVotePercentage(
                                        candidate.voteCount,
                                        totalVotes
                                      ),
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 mt-1 block">
                                  {getVotePercentage(
                                    candidate.voteCount,
                                    totalVotes
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showConfirmPublish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Publish Election Results</h2>
            </div>

            <div className="mb-6">
              <div className="flex items-start p-4 bg-yellow-50 rounded-md">
                <Info
                  size={20}
                  className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-yellow-800 font-medium mb-2">
                    Important Note
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Once published, results will be visible to all participants.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmPublish(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishResults}
                disabled={publishLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2"
              >
                {publishLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    Publish Results
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsManagement;
