import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Management.css";

const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setOrder] = useState("ASC");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, storeId: null, storeName: "" });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const params = {
        ...filters,
        sortBy,
        order: sortOrder,
      };
      const response = await adminAPI.getStores(params);
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

  const handleDeleteStore = async (id) => {
    const store = stores.find(s => s.id === id);
    setDeleteModal({ isOpen: true, storeId: id, storeName: store?.name || "" });
  };

  const confirmDeleteStore = async () => {
    try {
      await adminAPI.deleteStore(deleteModal.storeId);
      fetchStores();
      setDeleteModal({ isOpen: false, storeId: null, storeName: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete store");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management-container">
      <header className="management-header">
        <h1>Manage Stores</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Filter by name"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="email"
            placeholder="Filter by email"
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Filter by address"
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
          />
          <button onClick={handleFilterSubmit} className="filter-btn">
            Apply Filters
          </button>
        </div>
      </div>

      <div className="sort-section">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="address">Address</option>
          <option value="average_rating">Rating</option>
        </select>
        <select value={sortOrder} onChange={(e) => setOrder(e.target.value)}>
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>

      <table className="management-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.email}</td>
              <td>{store.address}</td>
              <td>
                {typeof store.average_rating === 'number' 
                  ? store.average_rating.toFixed(2) 
                  : "0.00"}
              </td>
              <td>
                <button
                  onClick={() => handleDeleteStore(store.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, storeId: null, storeName: "" })}
        title="Delete Store"
        message={`Are you sure you want to delete "${deleteModal.storeName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteStore}
        confirmText="Delete"
        cancelText="Cancel"
        type="confirm"
      />
    </div>
  );
};

export default ManageStores;
