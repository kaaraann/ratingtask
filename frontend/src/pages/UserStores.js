import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/StoresList.css";

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setOrder] = useState("ASC");
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchStores();
  }, [sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const params = {
        ...filters,
        sortBy,
        order: sortOrder,
      };
      const response = await userAPI.getStores(params);
      setStores(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = () => {
    setLoading(true);
    fetchStores();
  };

  const handleRateStore = async (storeId, isUpdate = false) => {
    if (ratingValue === 0) {
      setRatingMessage("Please select a rating");
      return;
    }

    try {
      if (isUpdate) {
        await userAPI.updateRating(storeId, { rating: ratingValue });
        setRatingMessage("Rating updated successfully!");
      } else {
        await userAPI.submitRating(storeId, { rating: ratingValue });
        setRatingMessage("Rating submitted successfully!");
      }
      setTimeout(() => {
        setSelectedStore(null);
        setRatingValue(0);
        setRatingMessage("");
        fetchStores();
      }, 1500);
    } catch (err) {
      setRatingMessage(
        err.response?.data?.message || "Failed to submit rating",
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="stores-container">
      <header className="stores-header">
        <h1>Browse Stores</h1>
        <div className="header-actions">
          <button
            onClick={() => navigate("/user/my-ratings")}
            className="nav-link"
          >
            My Ratings
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

      <div className="filters-section">
        <h3>Search Stores</h3>
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Search by name"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Search by address"
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
          />
          <button onClick={handleFilterSubmit} className="filter-btn">
            Search
          </button>
        </div>
      </div>

      <div className="sort-section">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="address">Address</option>
          <option value="average_rating">Rating</option>
        </select>
        <select value={sortOrder} onChange={(e) => setOrder(e.target.value)}>
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>

      <div className="stores-grid">
        {stores.map((store) => (
          <div key={store.id} className="store-card">
            <h3>{store.name}</h3>
            <p>
              <strong>Address:</strong> {store.address}
            </p>
            <p>
              <strong>Overall Rating:</strong>{" "}
              {typeof store.average_rating === 'number' 
                ? store.average_rating.toFixed(2) 
                : "No ratings"} ⭐
            </p>
            {store.userRating && (
              <p>
                <strong>Your Rating:</strong> {store.userRating} ⭐
              </p>
            )}
            <button
              onClick={() => setSelectedStore(store.id)}
              className="rate-btn"
            >
              {store.userRating ? "Update Rating" : "Rate Store"}
            </button>
          </div>
        ))}
      </div>

      {selectedStore && (
        <div className="modal">
          <div className="modal-content">
            <h3>Rate Store</h3>
            <div className="rating-input">
              <p>Select Rating:</p>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className={`star ${ratingValue >= star ? "active" : ""}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            {ratingMessage && <p className="message">{ratingMessage}</p>}
            <div className="modal-buttons">
              <button
                onClick={() =>
                  handleRateStore(
                    selectedStore,
                    stores.find((s) => s.id === selectedStore)?.userRating,
                  )
                }
                className="submit-btn"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setSelectedStore(null);
                  setRatingValue(0);
                  setRatingMessage("");
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStores;
