import React from "react";
import "../styles/Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "confirm",
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          {message && <p className="modal-message">{message}</p>}
          {children}
        </div>

        {type === "confirm" && (
          <div className="modal-footer">
            <button className="modal-btn modal-btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
            <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        )}

        {type === "alert" && (
          <div className="modal-footer">
            <button className="modal-btn modal-btn-confirm" onClick={onClose}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
