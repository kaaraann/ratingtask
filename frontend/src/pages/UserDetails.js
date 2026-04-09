import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Management.css";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await adminAPI.getUserDetails(id);
      setUser(response);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (error) {
    return (
      <div className="management-container">
        <header className="management-header">
          <h1>User Details</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </header>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="management-container">
        <header className="management-header">
          <h1>User Details</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </header>
        <div className="error-message">User not found</div>
      </div>
    );
  }

  return (
    <div className="management-container">
      <header className="management-header">
        <h1>User Details</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="details-card">
        <h2>User Information</h2>
        <div className="details-grid">
          <div className="detail-item">
            <label>User ID:</label>
            <span>{user.id}</span>
          </div>
          <div className="detail-item">
            <label>Name:</label>
            <span>{user.name}</span>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="detail-item">
            <label>Role:</label>
            <span>{user.role}</span>
          </div>
          <div className="detail-item">
            <label>Address:</label>
            <span>{user.address}</span>
          </div>
          {user.store_id && (
            <div className="detail-item">
              <label>Store ID:</label>
              <span>{user.store_id}</span>
            </div>
          )}
          {user.storeRating && (
            <div className="detail-item">
              <label>Store Rating:</label>
              <span>{typeof user.storeRating === 'number' ? user.storeRating.toFixed(2) : '0.00'} ⭐</span>
            </div>
          )}
          <div className="detail-item">
            <label>Created At:</label>
            <span>{new Date(user.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="form-actions">
          <button
            onClick={() => navigate("/admin/users")}
            className="cancel-btn"
          >
            ← Back to Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
