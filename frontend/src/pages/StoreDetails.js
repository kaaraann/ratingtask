import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Management.css";

const StoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchStoreDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      const response = await adminAPI.getStoreDetails(id);
      setStore(response);
      setRatings(response.ratings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load store details");
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
          <h1>Store Details</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </header>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="management-container">
        <header className="management-header">
          <h1>Store Details</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </header>
        <div className="error-message">Store not found</div>
      </div>
    );
  }

  return (
    <div className="management-container">
      <header className="management-header">
        <h1>Store Details</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="details-card">
        <h2>Store Information</h2>
        <div className="details-grid">
          <div className="detail-item">
            <label>Store ID:</label>
            <span>{store.id}</span>
          </div>
          <div className="detail-item">
            <label>Store Name:</label>
            <span>{store.name}</span>
          </div>
          <div className="detail-item">
            <label>Store Email:</label>
            <span>{store.email}</span>
          </div>
          <div className="detail-item">
            <label>Address:</label>
            <span>{store.address}</span>
          </div>
          <div className="detail-item">
            <label>Owner ID:</label>
            <span>{store.owner_id}</span>
          </div>
          <div className="detail-item">
            <label>Average Rating:</label>
            <span>{typeof store.average_rating === 'number' ? store.average_rating.toFixed(2) : '0.00'} ⭐</span>
          </div>
          <div className="detail-item">
            <label>Created At:</label>
            <span>{new Date(store.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="details-card">
        <h2>Ratings ({ratings.length})</h2>
        {ratings.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <table className="management-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={rating.id}>
                  <td>{rating.user_id}</td>
                  <td>{rating.rating} ⭐</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="form-actions">
        <button onClick={() => navigate("/admin/stores")} className="cancel-btn">
          ← Back to Stores
        </button>
      </div>
    </div>
  );
};

export default StoreDetails;
