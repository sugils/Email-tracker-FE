// src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.navbar-profile')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Close dropdown when changing location
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to safely get the first letter of the user's name
  const getInitial = () => {
    if (currentUser && currentUser.full_name && typeof currentUser.full_name === 'string') {
      return currentUser.full_name.charAt(0).toUpperCase();
    }
    return 'U'; // Default initial if full_name is not available
  };

  // Check if the route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <span className="material-icons">mail</span>
            <span className="logo-text">EmailCampaign</span>
          </Link>
        </div>

        {currentUser ? (
          <>
            <div className="navbar-tabs">
              <Link to="/dashboard" className={`navbar-tab ${isActive('/dashboard') ? 'active' : ''}`}>
                <span className="tab-icon">
                  <span className="material-icons">dashboard</span>
                </span>
                <span>Dashboard</span>
              </Link>
              <Link to="/campaigns" className={`navbar-tab ${isActive('/campaigns') ? 'active' : ''}`}>
                <span className="tab-icon">
                  <span className="material-icons">campaign</span>
                </span>
                <span>Campaigns</span>
              </Link>
              <Link to="/recipients" className={`navbar-tab ${isActive('/recipients') ? 'active' : ''}`}>
                <span className="tab-icon">
                  <span className="material-icons">people</span>
                </span>
                <span>Recipients</span>
              </Link>
            </div>
            
            <div className="navbar-profile" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="profile-avatar">
                {getInitial()}
              </div>
              {showDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="user-name">{currentUser.full_name || 'User'}</p>
                    <p className="user-email">{currentUser.email || 'No email'}</p>
                  </div>
                  <ul className="dropdown-list">
                    <li className="dropdown-item" onClick={() => navigate('/profile')}>
                      <span className="material-icons">account_circle</span>
                      <span>My Profile</span>
                    </li>
                    <li className="dropdown-item" onClick={() => navigate('/settings')}>
                      <span className="material-icons">settings</span>
                      <span>Settings</span>
                    </li>
                    <li className="dropdown-divider"></li>
                    <li className="dropdown-item" onClick={handleLogout}>
                      <span className="material-icons">logout</span>
                      <span>Logout</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="navbar-login">Login</Link>
            <Link to="/register" className="navbar-register">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;