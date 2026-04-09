import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
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

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)', color: '#ffffff' }}>
        <h1>System Administrator</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{dashboardData.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Stores</h3>
          <p className="stat-value">{dashboardData.totalStores}</p>
        </div>
        <div className="stat-card">
          <h3>Total Ratings</h3>
          <p className="stat-value">{dashboardData.totalRatings}</p>
        </div>
      </div>

      <div className="navigation-links">
        <Link to="/admin/users" className="nav-btn">
          Manage Users
        </Link>
        <Link to="/admin/stores" className="nav-btn">
          Manage Stores
        </Link>
        <Link to="/admin/add-store" className="nav-btn">
          Add New Store
        </Link>
        <Link to="/admin/add-user" className="nav-btn">
          Add New User
        </Link>
        <Link to="/admin/add-admin" className="nav-btn">
          Add New Admin
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
