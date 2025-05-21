// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ApiTest from './components/auth/ApiTest';
import Dashboard from './components/dashboard/Dashboard';
import CampaignList from './components/campaigns/CampaignList';
import CampaignCreate from './components/campaigns/CampaignCreate';
import CampaignDetail from './components/campaigns/CampaignDetail';
import RecipientList from './components/recipients/RecipientList';
import RecipientCreate from './components/recipients/RecipientCreate';
import RecipientBulkUpload from './components/recipients/RecipientBulkUpload';
import RecipientEditForm from './components/recipients/RecipientEditForm';
import PrivateRoute from './utils/PrivateRoute';
import './App.css';

// Layout component that conditionally renders the Navbar
const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // List of paths where we don't want to show the Navbar
  const authPaths = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authPaths.includes(location.pathname);
  
  // Don't show navbar on auth pages (login, register, etc.)
  const showNavbar = !isAuthPage;
  
  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <main className={`main-content ${!showNavbar ? 'full-height' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/api-test" element={<ApiTest />} />
          
          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Campaign Routes */}
          <Route path="/campaigns" element={<PrivateRoute><CampaignList /></PrivateRoute>} />
          <Route path="/campaigns/create" element={<PrivateRoute><CampaignCreate /></PrivateRoute>} />
          <Route path="/campaigns/:campaignId" element={<PrivateRoute><CampaignDetail /></PrivateRoute>} />
          
          {/* Recipient Routes */}
          <Route path="/recipients" element={<PrivateRoute><RecipientList /></PrivateRoute>} />
          <Route path="/recipients/create" element={<PrivateRoute><RecipientCreate /></PrivateRoute>} />
          <Route path="/recipients/import" element={<PrivateRoute><RecipientBulkUpload /></PrivateRoute>} />
          <Route path="/recipients/:id/edit" element={<PrivateRoute><RecipientEditForm /></PrivateRoute>} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;