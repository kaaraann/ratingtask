import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Management.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    role: "",
    address: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setOrder] = useState("ASC");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: "" });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      const params = {
        ...filters,
        sortBy,
        order: sortOrder,
      };
      const response = await adminAPI.getUsers(params);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
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
    fetchUsers();
  };

  const handleDeleteUser = async (id) => {
    const user = users.find(u => u.id === id);
    setDeleteModal({ isOpen: true, userId: id, userName: user?.name || "" });
  };

  const confirmDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(deleteModal.userId);
      fetchUsers();
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
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
        <h1>Manage Users</h1>
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
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
          </select>
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
          <option value="role">Role</option>
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
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td>
                <button
                  onClick={() => handleDeleteUser(user.id)}
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
        onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: "" })}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.userName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteUser}
        confirmText="Delete"
        cancelText="Cancel"
        type="confirm"
      />
    </div>
  );
};

export default ManageUsers;
