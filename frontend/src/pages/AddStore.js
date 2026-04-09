import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import "../styles/Management.css";

const AddStore = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    ownerAddress: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, storeName: "" });
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
      await adminAPI.createStore(formData);
      setSuccessModal({ isOpen: true, storeName: formData.name });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setSuccessModal({ isOpen: false, storeName: "" });
    navigate("/admin/stores");
  };

  return (
    <div className="management-container">
      <h2 style={{ marginTop: 'var(--spacing-8)' }}>Add New Store</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="add-form large-form">
        <div className="form-sections">
          <div className="form-section">
            <div className="section-header">
              <h3>🏪 Store Information</h3>
            </div>

            <div className="form-group">
              <label htmlFor="name">Store Name (20-60 characters):</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                minLength="20"
                maxLength="60"
                placeholder="Enter store name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Store Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="store@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Store Address (max 400 characters):
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                maxLength="400"
                placeholder="Enter complete store address"
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>👤 Store Owner Information (Login Account)</h3>
            </div>

            <div className="form-group">
              <label htmlFor="ownerName">
                Owner Name (20-60 characters):
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                minLength="20"
                maxLength="60"
                placeholder="Enter owner name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ownerEmail">Login Email:</label>
              <input
                type="email"
                id="ownerEmail"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="owner@example.com"
                required
              />
              <small className="hint">
                Store owner will login with this email
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="ownerPassword">
                Login Password (8-16 chars, 1 uppercase, 1 special char):
              </label>
              <input
                type="password"
                id="ownerPassword"
                name="ownerPassword"
                value={formData.ownerPassword}
                onChange={handleChange}
                minLength="8"
                maxLength="16"
                placeholder="e.g., Owner@123"
                required
                pattern="^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$"
                title="Password must be 8-16 chars with at least 1 uppercase and 1 special character (@$!%*?&)"
              />
              <small className="hint">
                Share this password with the store owner securely
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="ownerAddress">
                Owner Address (max 400 characters):
              </label>
              <textarea
                id="ownerAddress"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleChange}
                maxLength="400"
                placeholder="Enter owner address"
                rows="3"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating Store..." : "✓ Create Store"}
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
        title="Store Created Successfully"
        message={`Store "${successModal.storeName}" and owner account have been created successfully.`}
        onConfirm={handleModalClose}
        confirmText="OK"
        type="alert"
      />
    </div>
  );
};

export default AddStore;
