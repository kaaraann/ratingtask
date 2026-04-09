import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageStores from "./pages/ManageStores";
import AddUser from "./pages/AddUser";
import AddStore from "./pages/AddStore";
import AddAdmin from "./pages/AddAdmin";
import UserDetails from "./pages/UserDetails";
import StoreDetails from "./pages/StoreDetails";
import UserStores from "./pages/UserStores";
import UserProfile from "./pages/UserProfile";
import MyRatings from "./pages/MyRatings";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import StoreOwnerProfile from "./pages/StoreOwnerProfile";
import "./styles/theme.css";
import "./styles/Dashboard.css";
import "./styles/Management.css";
import "./App.css";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === "store_owner") {
      return <Navigate to="/store-owner/dashboard" />;
    } else {
      return <Navigate to="/user/stores" />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageStores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-user"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-store"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddStore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/store/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <StoreDetails />
              </ProtectedRoute>
            }
          />

          {/* User routes */}
          <Route
            path="/user/stores"
            element={
              <ProtectedRoute requiredRole="user">
                <UserStores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute requiredRole="user">
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/my-ratings"
            element={
              <ProtectedRoute requiredRole="user">
                <MyRatings />
              </ProtectedRoute>
            }
          />

          {/* Store owner routes */}
          <Route
            path="/store-owner/dashboard"
            element={
              <ProtectedRoute requiredRole="store_owner">
                <StoreOwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store-owner/profile"
            element={
              <ProtectedRoute requiredRole="store_owner">
                <StoreOwnerProfile />
              </ProtectedRoute>
            }
          />

          {/* Redirect home to login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
