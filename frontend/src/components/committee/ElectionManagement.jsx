import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CalendarClock,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Clock,
} from "lucide-react";

const API_BASE_URL = "/api/election";

const ElectionManagement = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentElection, setCurrentElection] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/committee/elections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      setElections(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setLoading(false);
    }
  };

  const handleCreateElection = async (electionData) => {
    try {
      await axios.post(`${API_BASE_URL}/committee/elections`, electionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      fetchElections();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating election:", error);
    }
  };

  const handleUpdateElection = async (id, electionData) => {
    try {
      await axios.put(
        `${API_BASE_URL}/committee/elections/${id}`,
        electionData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      fetchElections();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating election:", error);
    }
  };

  const handleDeleteElection = async (id) => {
    if (window.confirm("Are you sure you want to delete this election?")) {
      try {
        await axios.delete(`${API_BASE_URL}/committee/elections/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        fetchElections();
      } catch (error) {
        console.error("Error deleting election:", error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-200 text-gray-800", label: "Draft" },
      nomination: {
        color: "bg-blue-200 text-blue-800",
        label: "Nomination Open",
      },
      voting: { color: "bg-green-200 text-green-800", label: "Voting Active" },
      completed: { color: "bg-purple-200 text-purple-800", label: "Completed" },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Elections Management</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          Create Election
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading elections...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Election Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voting Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {elections.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No elections found. Create your first election to get
                    started.
                  </td>
                </tr>
              ) : (
                elections.map((election) => (
                  <tr key={election._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {election.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {election.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(election.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarClock size={16} className="mr-1" />
                        <div>
                          <div>{formatDate(election.votingStart)}</div>
                          <div>to {formatDate(election.votingEnd)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            setCurrentElection(election);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteElection(election._id)}
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
        <ElectionFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateElection}
          title="Create New Election"
        />
      )}

      {showEditModal && currentElection && (
        <ElectionFormModal
          onClose={() => setShowEditModal(false)}
          onSubmit={(data) => handleUpdateElection(currentElection._id, data)}
          title="Edit Election"
          election={currentElection}
        />
      )}
    </div>
  );
};

const ElectionFormModal = ({ onClose, onSubmit, title, election = null }) => {
  const [formData, setFormData] = useState({
    title: election?.title || "",
    description: election?.description || "",
    votingStart: election?.votingStart
      ? new Date(election.votingStart).toISOString().slice(0, 16)
      : "",
    votingEnd: election?.votingEnd
      ? new Date(election.votingEnd).toISOString().slice(0, 16)
      : "",
    status: election?.status || "draft",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
              Election Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voting Start Time*
              </label>
              <input
                type="datetime-local"
                name="votingStart"
                value={formData.votingStart}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voting End Time*
              </label>
              <input
                type="datetime-local"
                name="votingEnd"
                value={formData.votingEnd}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="nomination">Nomination Open</option>
              <option value="voting">Voting Active</option>
              <option value="completed">Completed</option>
            </select>
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
              {election ? "Update Election" : "Create Election"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElectionManagement;
