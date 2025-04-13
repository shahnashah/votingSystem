import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  BarChart,
  Calendar,
  Link as LinkIcon,
  LogOut,
  Settings,
  User,
  Users,
  Vote,
  Menu,
  X,
} from "lucide-react";

import ElectionManagement from "../../components/committee/ElectionManagement";
import PostManagement from "../../components/committee/PostManagement";
import NominationManagement from "../../components/committee/NominationManagement";
import LinkManagement from "../../components/committee/LinkManagement";
import ResultsManagement from "../../components/committee/ResultManagement";

const CommitteeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("elections");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    const response = await axios.post("/api/auth/logout");
    if (response.data.success) {
      navigate("/");
    }
    navigate("/");
  };

  const navItems = [
    { id: "elections", label: "Elections", icon: <Calendar size={20} /> },
    { id: "posts", label: "Posts", icon: <User size={20} /> },
    { id: "nominations", label: "Nominations", icon: <Users size={20} /> },
    { id: "links", label: "Links", icon: <LinkIcon size={20} /> },
    { id: "results", label: "Results", icon: <BarChart size={20} /> },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "elections":
        return <ElectionManagement />;
      case "posts":
        return <PostManagement />;
      case "nominations":
        return <NominationManagement />;
      case "links":
        return <LinkManagement />;
      case "results":
        return <ResultsManagement />;
      default:
        return <ElectionManagement />;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar for larger screens */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative z-30 transition-transform duration-300 ease-in-out md:translate-x-0 h-full bg-gradient-to-b from-purple-700 to-indigo-800 text-white flex flex-col shadow-lg md:w-64 w-72`}
      >
        <div className="p-5 border-b border-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Vote size={24} className="mr-2 text-purple-200" />
              <h1 className="text-xl font-bold">VoteFlow</h1>
            </div>
            <button
              className="md:hidden text-white hover:text-purple-200"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-indigo-200 text-sm mt-1">Committee Dashboard</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="px-3 py-1">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-indigo-900 text-white shadow-md"
                      : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-8">
                    {item.icon}
                  </span>
                  <span className="ml-2 font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-5 border-t border-indigo-600">
          <div className="flex flex-col">
            <button
              className="flex items-center text-indigo-200 hover:text-white mb-3 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => navigate("/committee/settings")}
            >
              <Settings size={20} className="mr-2" />
              Settings
            </button>
            <button
              className="flex items-center text-indigo-200 hover:text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar for mobile */}
        <header className="bg-white border-b border-gray-200 shadow-sm md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="mr-2 text-gray-600 hover:text-indigo-700"
                onClick={toggleSidebar}
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center">
                <Vote size={20} className="mr-2 text-indigo-700" />
                <h1 className="text-lg font-bold text-gray-800">VoteFlow</h1>
              </div>
            </div>
            <div className="text-sm font-medium text-indigo-700">
              {navItems.find((item) => item.id === activeTab)?.label}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* Overlay when sidebar is open on mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Content wrapper with nice styling */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 h-full">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommitteeDashboard;
