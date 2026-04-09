import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/MyRatings.css";

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await userAPI.getMyRatings();
      setRatings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load ratings");
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
    <div className="my-ratings-container">
      <header className="ratings-header">
        <h1>My Ratings</h1>
        <div className="header-actions">
          <button onClick={() => navigate("/user/stores")} className="nav-link">
            Browse Stores
          </button>
          <button
            onClick={() => navigate("/user/profile")}
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

      <div className="ratings-content">
        {ratings.length === 0 ? (
          <div className="no-ratings">
            <p>You haven't rated any stores yet.</p>
            <button
              onClick={() => navigate("/user/stores")}
              className="browse-btn"
            >
              Browse Stores
            </button>
          </div>
        ) : (
          <div className="ratings-grid">
            {ratings.map((rating) => (
              <div key={rating.id} className="rating-card">
                <h3>{rating.store_name}</h3>
                <p>
                  <strong>Address:</strong> {rating.address}
                </p>
                <div className="rating-display">
                  <span className="rating-label">Your Rating:</span>
                  <span className="rating-stars">
                    {"⭐".repeat(rating.rating)}
                    <span className="rating-number">({rating.rating}/5)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRatings;
