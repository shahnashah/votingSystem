import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Filter,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = "/api";

const NominationManagement = () => {
  const [nominations, setNominations] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentElectionId, setCurrentElectionId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentNomination, setCurrentNomination] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

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
      fetchNominations(currentElectionId, statusFilter);
    }
  }, [currentElectionId, statusFilter]);

  const fetchNominations = async (electionId, status) => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/nomination/${electionId}/nominations${
        status !== "all" ? `?status=${status}` : ""
      }`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      setNominations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching nominations:", error);
      setLoading(false);
    }
  };

  const handleApproveNomination = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/nomination/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      fetchNominations(currentElectionId, statusFilter);
      setShowApproveModal(false);
    } catch (error) {
      console.error("Error approving nomination:", error);
    }
  };

  const handleRejectNomination = async (id, rejectionReason) => {
    try {
      await axios.put(
        `${API_BASE_URL}/nomination/${id}/reject`,
        { rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      fetchNominations(currentElectionId, statusFilter);
      setShowRejectModal(false);
    } catch (error) {
      console.error("Error rejecting nomination:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-200 text-yellow-800",
        label: "Pending Review",
      },
      approved: { color: "bg-green-200 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-200 text-red-800", label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nomination Management</h1>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
          onClick={() => fetchNominations(currentElectionId, statusFilter)}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {elections.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-6">
          No elections found. Please create an election first.
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Election
            </label>
            <select
              value={currentElectionId}
              onChange={(e) => setCurrentElectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {elections.map((election) => (
                <option key={election._id} value={election._id}>
                  {election.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <div className="flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Nominations</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading nominations...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nominations.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No nominations found for this election.
                  </td>
                </tr>
              ) : (
                nominations.map((nomination) => (
                  <tr key={nomination._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {nomination.candidate.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {nomination.candidate.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {nomination.post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(nomination.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {nomination.paymentReceipt ? (
                        <button
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          onClick={() =>
                            window.open(nomination.paymentReceipt, "_blank")
                          }
                        >
                          <Eye size={16} />
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          No receipt uploaded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                          onClick={() => {
                            setCurrentNomination(nomination);
                            setShowDetailModal(true);
                          }}
                        >
                          <FileText size={16} />
                          Details
                        </button>

                        {nomination.status === "pending" && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              onClick={() => {
                                setCurrentNomination(nomination);
                                setShowApproveModal(true);
                              }}
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              onClick={() => {
                                setCurrentNomination(nomination);
                                setShowRejectModal(true);
                              }}
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetailModal && currentNomination && (
        <NominationDetailModal
          nomination={currentNomination}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showApproveModal && currentNomination && (
        <ConfirmationModal
          title="Approve Nomination"
          message={`Are you sure you want to approve ${currentNomination.candidate.name}'s nomination for the position of ${currentNomination.post.title}?`}
          confirmText="Approve Nomination"
          confirmIcon={<CheckCircle size={16} />}
          confirmColor="bg-green-600"
          onConfirm={() => handleApproveNomination(currentNomination._id)}
          onCancel={() => setShowApproveModal(false)}
        />
      )}

      {showRejectModal && currentNomination && (
        <RejectNominationModal
          nomination={currentNomination}
          onReject={(reason) =>
            handleRejectNomination(currentNomination._id, reason)
          }
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
};

const NominationDetailModal = ({ nomination, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nomination Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Candidate Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <p className="font-medium">{nomination.candidate.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium">{nomination.candidate.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="font-medium">{nomination.candidate.phone}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Nomination Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Post:</span>
                <p className="font-medium">{nomination.post.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Election:</span>
                <p className="font-medium">{nomination.election.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <p className="font-medium">
                  {nomination.status === "pending"
                    ? "Pending Review"
                    : nomination.status === "approved"
                    ? "Approved"
                    : "Rejected"}
                </p>
              </div>
              {nomination.status === "rejected" && (
                <div>
                  <span className="text-sm text-gray-500">
                    Rejection Reason:
                  </span>
                  <p className="font-medium text-red-600">
                    {nomination.rejectionReason}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">Submitted On:</span>
                <p className="font-medium">
                  {new Date(nomination.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Agenda</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            {nomination.agenda ? (
              <p className="whitespace-pre-line">{nomination.agenda}</p>
            ) : (
              <p className="text-gray-500 italic">No agenda provided</p>
            )}
          </div>
        </div>

        {nomination.paymentReceipt && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Payment Receipt</h3>
            <div className="bg-gray-50 p-4 rounded-md flex items-center justify-center">
              <img
                src={nomination.paymentReceipt}
                alt="Payment Receipt"
                className="max-h-64 object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({
  title,
  message,
  confirmText,
  confirmIcon,
  confirmColor,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>

        <p className="mb-6 text-gray-700">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 ${confirmColor} text-white rounded-md flex items-center gap-2`}
          >
            {confirmIcon}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const RejectNominationModal = ({ nomination, onReject, onCancel }) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onReject(rejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Reject Nomination</h2>
        </div>

        <p className="mb-4 text-gray-700">
          You are about to reject {nomination.candidate.name}'s nomination for{" "}
          {nomination.post.title}.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason*
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              required
              placeholder="Please provide a reason for rejection"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2"
              disabled={!rejectionReason.trim()}
            >
              <XCircle size={16} />
              Reject Nomination
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NominationManagement;
