// App.jsx
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import UnauthPage from "./pages/UnauthPage";
import AdminDashboard from "./pages/admin/Dashboard";
import CandidateDashboard from "./pages/candidate/Dashboard";
import CommitteeDashboard from "./pages/committee/CommitteeDashboard ";
import VoterDashboard from "./pages/voter/Dashboard";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";
import CreateOrganization from "./pages/admin/CreateOrganization";
import SignupPage from "./pages/auth/Signup";
import VerifyEmailPage from "./pages/auth/EmailVerify";
import HomePage from "./pages/Home";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col overflow-hidden bg-white">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/unauth-page" element={<UnauthPage />} />

            {/* Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-organization"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CreateOrganization />
                </ProtectedRoute>
              }
            />

            <Route
              path="/committee"
              element={
                <ProtectedRoute allowedRoles={["committee"]}>
                  <CommitteeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/candidate"
              element={
                <ProtectedRoute allowedRoles={["candidate"]}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/voter"
              element={
                <ProtectedRoute allowedRoles={["voter"]}>
                  <VoterDashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/auth/login" />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
