import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Landing Page
import LandingPage from './pages/landing/LandingPage';

// Auth Pages
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import UserProfile from './pages/user/UserProfile';

import AdminRegister from './pages/auth/admin/AdminRegister';
import AdminLogin from './pages/auth/admin/AdminLogin';
import AdminVerifyEmail from './pages/auth/admin/AdminVerifyEmail';
import AdminForgotPassword from './pages/auth/admin/AdminForgotPassword';

// Dashboard & Pages
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import ImpactLogs from './pages/analytics/ImpactLogs';
import ImpactSettings from './pages/analytics/ImpactSettings';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';
import RecyclerLayout from './components/layout/RecyclerLayout';

// E-Waste Pages
import EwasteList from "./pages/ewaste/EwasteList";
import CreateEwaste from "./pages/ewaste/CreateEwaste";
import EditEwaste from "./pages/ewaste/EditEwaste";
import EwasteHome from "./pages/ewaste/EwasteHome";

// Recycler Pages
import RecyclerRequestPage from "./pages/recycler/RecyclerRequestPage";
import RecyclerProfile from "./pages/recycler/RecyclerProfile";
import RecyclerDashboard from './pages/recycler/RecyclerDashboard';

// Admin Pages
import RecyclerRequestsPage from "./pages/admin/RecyclerRequestsPage";
import UserManagement from "./pages/admin/Users";
import AdminProfile from "./pages/admin/AdminProfile";

// Other Pages
import RecyclerPickupsPage from "./pages/pickups/RecyclerPickupsPage"; // recycler


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* ================= USER AUTH ROUTES ================= */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= ADMIN AUTH ROUTES ================= */}
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/verify-email" element={<AdminVerifyEmail />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* ================= ADMIN DASHBOARD ROUTES ================= */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AnalyticsDashboard />} />
          <Route path="/admin/logs" element={<ImpactLogs />} />
          <Route path="/admin/settings" element={<ImpactSettings />} />
          <Route path="/admin/ewaste" element={<EwasteList />} />
          <Route path="/admin/recycler-requests" element={<RecyclerRequestsPage />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* ================= USER DASHBOARD ROUTES ================= */}
        <Route element={<UserLayout />}>
          <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/user/dashboard" element={<EwasteHome />} />
          {/* <Route path="/user/ewaste" element={<EwasteList />} /> */}
          <Route path="/user/items" element={<EwasteList />} />
          <Route path="/user/ewaste/create" element={<CreateEwaste />} />
          <Route path="/user/ewaste/edit/:id" element={<EditEwaste />} />
          <Route path="/recycler-request" element={<RecyclerRequestPage />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* ================= RECYCLER DASHBOARD ROUTES ================= */}
        <Route element={<RecyclerLayout />}>
          <Route path="/recycler/dashboard" element={<RecyclerDashboard />} />
          <Route path="/pickups" element={<RecyclerPickupsPage mode="pending"/>} />
          <Route path="/pickups/accepted" element={<RecyclerPickupsPage mode="accepted" />} />
          <Route path="/pickups/collected" element={<RecyclerPickupsPage mode="collected" />} />
          <Route path="/pickups/completed" element={<RecyclerPickupsPage mode="completed" />} />
          <Route path="/recycler/ewaste" element={<EwasteList />} />
          <Route path="/recycler/profile" element={<RecyclerProfile />} />
        </Route>

      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;