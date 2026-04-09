import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeOwnerAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/StoreOwnerDashboard.css";

const StoreOwnerDashboard = () => {
  const [dashboard, setDashboard] = useState({
    store: null,
    totalRatings: 0,
  });
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashboardRes, ratingsRes] = await Promise.all([
        storeOwnerAPI.getDashboard(),
        storeOwnerAPI.getStoreRatings(),
      ]);

      setDashboard(dashboardRes.data);
      setRatings(ratingsRes.data);
      setAverageRating(dashboardRes.data.store.averageRating || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!dashboard.store) {
    return (
      <div className="store-owner-container">
        <header className="dashboard-header">
          <h1>Store Owner Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </header>
        <p className="no-store">No store assigned to your account</p>
      </div>
    );
  }

  return (
    <div className="store-owner-container">
      <header className="dashboard-header">
        <h1>Store Owner Dashboard</h1>
        <div className="header-actions">
          <button
            onClick={() => navigate("/store-owner/profile")}
            className="nav-link"
          >
            Profile
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="store-info">
        <h2>{dashboard.store.name}</h2>
        <div className="info-grid">
          <div className="info-card">
            <h4>Average Rating</h4>
            <p className="info-value">{typeof averageRating === 'number' ? averageRating.toFixed(2) : '0.00'} ⭐</p>
          </div>
          <div className="info-card">
            <h4>Total Ratings</h4>
            <p className="info-value">{dashboard.totalRatings}</p>
          </div>
        </div>
      </div>

      <div className="ratings-section">
        <h3>Recent Ratings</h3>
        {ratings.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <table className="ratings-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>User Email</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={rating.id}>
                  <td>{rating.user_name}</td>
                  <td>{rating.user_email}</td>
                  <td>{rating.rating} ⭐</td>
                  <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
