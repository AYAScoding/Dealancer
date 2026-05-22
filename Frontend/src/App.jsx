import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Page Imports
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import JobMarketplace from "./pages/JobMarketplace";
import JobDetail from "./pages/JobDetail";
import JobForm from "./pages/JobForm";
import Profile from "./pages/Profile";

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Client Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/jobs/new" element={<JobForm />} />
          </Route>

          {/* Freelancer Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["FREELANCER"]} />}>
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/jobs" element={<JobMarketplace />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
          </Route>

          {/* Shared Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
