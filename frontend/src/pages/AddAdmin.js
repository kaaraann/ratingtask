import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Management.css";

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "admin",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, userName: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminAPI.createUser(formData);
      setSuccessModal({ isOpen: true, userName: formData.name });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setSuccessModal({ isOpen: false, userName: "" });
    navigate("/admin/users");
  };

  return (
    <div className="management-container">
      <h2 style={{ marginTop: 'var(--spacing-8)' }}>Add New Administrator</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-section">
          <div className="section-header">
            <h3>👑 Administrator Information</h3>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name (20-60 characters):</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength="20"
              maxLength="60"
              placeholder="Enter administrator full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password (8-16 chars, 1 uppercase, 1 special char):
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              maxLength="16"
              placeholder="e.g., Admin@123"
              required
              pattern="^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$"
              title="Password must be 8-16 chars with at least 1 uppercase and 1 special character (@$!%*?&)"
            />
            <small className="hint">Use strong passwords for security</small>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address (max 400 characters):</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              maxLength="400"
              placeholder="Enter administrator address"
              rows="3"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating Administrator..." : "✓ Create Administrator"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="cancel-btn"
          >
            ✕ Cancel
          </button>
        </div>
      </form>

      <Modal
        isOpen={successModal.isOpen}
        onClose={handleModalClose}
        title="Administrator Created Successfully"
        message={`Administrator "${successModal.userName}" has been created successfully with full system access.`}
        onConfirm={handleModalClose}
        confirmText="OK"
        type="alert"
      />
    </div>
  );
};

export default AddAdmin;
