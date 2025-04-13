import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Building,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";

// Set axios defaults
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL; // Change to your API base URL
axios.defaults.headers.common["Content-Type"] = "application/json";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("organizations");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState("create");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "NGO",
    contactInfo: {
      email: "",
      phone: "",
      address: "",
    },
    committeeMembers: [],
  });

  const navigate = useNavigate();

  // Fetch organizations and users on component mount
  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
  }, []);

  // Fetch all organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/organizations/");

      setOrganizations(response.data);
    } catch (err) {
      setError("Failed to fetch organizations. Please try again.");
      console.error("Error fetching organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new organization
  const createOrganization = async (orgData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/organizations/", orgData, {
        withCredentials: true,
      });
      setOrganizations([...organizations, response.data]);
      return response.data;
    } catch (err) {
      setError("Failed to create organization. Please try again.");
      console.error("Error creating organization:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update existing organization
  const updateOrganization = async (id, orgData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/organizations/${id}`, orgData);
      const updatedOrgs = organizations.map((org) =>
        org._id === id ? response.data : org
      );
      setOrganizations(updatedOrgs);
      return response.data;
    } catch (err) {
      setError("Failed to update organization. Please try again.");
      console.error("Error updating organization:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete organization
  const deleteOrganization = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/organizations/${id}`);
      const updatedOrgs = organizations.filter((org) => org._id !== id);
      setOrganizations(updatedOrgs);
      return true;
    } catch (err) {
      setError("Failed to delete organization. Please try again.");
      console.error("Error deleting organization:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Assign committee members to organization
  const assignCommitteeMembers = async (orgId, memberIds) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `/api/organizations/${orgId}/committee`,
        {
          committeeMembers: memberIds,
        }
      );
      const updatedOrgs = organizations.map((org) =>
        org._id === orgId ? response.data : org
      );
      setOrganizations(updatedOrgs);
      return response.data;
    } catch (err) {
      setError("Failed to assign committee members. Please try again.");
      console.error("Error assigning committee members:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user role to committee
  const updateUserRole = async (userId, newRole) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/admin/${userId}/role`, {
        role: newRole,
      });
      const updatedUsers = users.map((user) =>
        user._id === userId ? response.data : user
      );
      setUsers(updatedUsers);
      return response.data;
    } catch (err) {
      setError("Failed to update user role. Please try again.");
      console.error("Error updating user role:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openCreateForm = () => {
    setFormData({
      name: "",
      type: "NGO",
      contactInfo: {
        email: "",
        phone: "",
        address: "",
      },
      committeeMembers: [],
    });
    setFormType("create");
    setIsFormOpen(true);
  };

  const openEditForm = (org) => {
    setFormData({
      name: org.name,
      type: org.type,
      contactInfo: {
        email: org.contactInfo.email,
        phone: org.contactInfo.phone,
        address: org.contactInfo.address || "",
      },
      committeeMembers: org.committeeMembers || [],
    });
    setSelectedOrg(org._id);
    setFormType("edit");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleMemberChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData({
      ...formData,
      committeeMembers: selectedOptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let success = false;

    if (formType === "create") {
      const result = await createOrganization(formData);
      success = !!result;
    } else {
      const result = await updateOrganization(selectedOrg, formData);
      success = !!result;

      // If committee members were updated, update their roles
      if (success && formData.committeeMembers.length > 0) {
        await assignCommitteeMembers(selectedOrg, formData.committeeMembers);

        // Update user roles to committee if needed
        for (const memberId of formData.committeeMembers) {
          const user = users.find((u) => u._id === memberId);
          if (user && user.role !== "committee") {
            await updateUserRole(memberId, "committee");
          }
        }
      }
    }

    if (success) {
      closeForm();
    }
  };

  const handleDeleteOrg = async (orgId) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      const success = await deleteOrganization(orgId);
      if (success) {
        // Refresh the list
        fetchOrganizations();
      }
    }
  };

  const logoutHandler = async () => {
    const response = await axios.post("/api/auth/logout");
    if (response.data.success) {
      navigate("/");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.role === "admin" ||
      user.role === "committee" ||
      user.role === "voter"
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out
        bg-white shadow-lg`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>

          <nav className="flex-1 px-3 mt-6 space-y-1">
            <button
              className={`flex items-center w-full px-4 py-3 rounded-lg ${
                activeTab === "organizations"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("organizations")}
            >
              <Building className="w-5 h-5 mr-3" />
              <span>Organizations</span>
            </button>

            <button
              className={`flex items-center w-full px-4 py-3 rounded-lg ${
                activeTab === "committees"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("committees")}
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Committees</span>
            </button>

            <button
              className={`flex items-center w-full px-4 py-3 rounded-lg ${
                activeTab === "users"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("users")}
            >
              <User className="w-5 h-5 mr-3" />
              <span>Users</span>
            </button>
          </nav>

          <div className="px-3 py-6">
            <button
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={logoutHandler}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 overflow-auto ${isSidebarOpen ? "lg:ml-0" : "ml-0"}`}
      >
        <header className="bg-white shadow-sm">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === "organizations" && "Organization Management"}
              {activeTab === "committees" && "Election Committees"}
              {activeTab === "users" && "User Management"}
            </h1>
          </div>
        </header>

        <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Error message display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === "organizations" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700">
                  Organizations
                </h2>
                <button
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={openCreateForm}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Organization
                </button>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {!loading && organizations.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No organizations found</p>
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={openCreateForm}
                      disabled={loading}
                    >
                      Create Your First Organization
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {organizations.map((org) => (
                      <li key={org._id}>
                        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-4 sm:mb-0">
                            <h3 className="text-lg font-medium text-gray-900">
                              {org.name}
                            </h3>
                            <div className="mt-1 sm:flex sm:items-center sm:space-x-4">
                              <p className="text-sm text-gray-500">
                                Type: {org.type}
                              </p>
                              <p className="text-sm text-gray-500">
                                Email: {org.contactInfo.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                Phone: {org.contactInfo.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                              onClick={() => openEditForm(org)}
                              disabled={loading}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                              onClick={() => handleDeleteOrg(org._id)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Committees Tab */}
          {activeTab === "committees" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-6">
                Election Committees
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {!loading && organizations.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      Create an organization first to assign committees
                    </p>
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => {
                        setActiveTab("organizations");
                        openCreateForm();
                      }}
                      disabled={loading}
                    >
                      Create Organization
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {organizations.map((org) => {
                      const committeeUsers = users.filter(
                        (user) =>
                          org.committeeMembers &&
                          org.committeeMembers.some(
                            (member) => member._id === user._id
                          )
                      );

                      return (
                        <li key={org._id}>
                          <div className="px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {org.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Committee Members:
                            </p>

                            {committeeUsers.length > 0 ? (
                              <ul className="mt-2 divide-y divide-gray-100 border border-gray-200 rounded-md">
                                {committeeUsers.map((user) => (
                                  <li key={user._id} className="px-4 py-3">
                                    <div className="flex items-center">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-800">
                                          {user.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {user.email}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {user.phone}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500 italic">
                                No committee members assigned
                              </p>
                            )}

                            <button
                              className="mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                              onClick={() => {
                                setSelectedOrg(org._id);
                                openEditForm(org);
                              }}
                              disabled={loading}
                            >
                              Manage Committee
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-6">
                System Users
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {!loading && users.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <li key={user._id}>
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {user.name}
                              </h3>
                              <div className="mt-1">
                                <p className="text-sm text-gray-500">
                                  Email: {user.email}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Phone: {user.phone}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Role: {user.role}
                                </p>
                                {user.organization && (
                                  <p className="text-sm text-gray-500">
                                    Organization:{" "}
                                    {organizations.find(
                                      (org) => org._id === user.organization
                                    )?.name || "Unknown"}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "committee"
                                  ? "bg-blue-100 text-blue-800"
                                  : user.role === "candidate"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Organization Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={closeForm}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {formType === "create"
                    ? "Create Organization"
                    : "Edit Organization"}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={closeForm}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="NGO">NGO</option>
                    <option value="Society">Society</option>
                    <option value="Club">Club</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="contactInfo.address"
                    value={formData.contactInfo.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Committee Members
                  </label>
                  <select
                    multiple
                    name="committeeMembers"
                    value={formData.committeeMembers}
                    onChange={handleMemberChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    size="4"
                  >
                    {filteredUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple members. Users will have
                    their role updated to committee member.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {formType === "create" ? "Creating..." : "Updating..."}
                      </span>
                    ) : formType === "create" ? (
                      "Create"
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
