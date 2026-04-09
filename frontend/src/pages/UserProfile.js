import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updatePassword(passwordData);
      setMessage("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
      setShowPasswordForm(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>User Profile</h1>
        <div className="header-actions">
          <button onClick={() => navigate("/user/stores")} className="nav-link">
            Browse Stores
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="profile-card">
        <h2>Profile Information</h2>
        {user && (
          <div className="profile-info">
            <div className="info-row">
              <label>Name:</label>
              <p>{user.name}</p>
            </div>
            <div className="info-row">
              <label>Email:</label>
              <p>{user.email}</p>
            </div>
            <div className="info-row">
              <label>Address:</label>
              <p>{user.address}</p>
            </div>
            <div className="info-row">
              <label>Role:</label>
              <p>{user.role === "user" ? "Normal User" : user.role}</p>
            </div>
          </div>
        )}
      </div>

      <div className="password-card">
        <h2>Password Settings</h2>
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="change-password-btn"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">
                New Password (8-16 chars, uppercase & special char):
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength="8"
                maxLength="16"
                required
                pattern="^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$"
                title="Password must be 8-16 chars with at least 1 uppercase and 1 special character (@$!%*?&)"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                  });
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
