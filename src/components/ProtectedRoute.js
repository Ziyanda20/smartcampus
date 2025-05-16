import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const token = localStorage.getItem("token");
  let userRole = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token"); // Remove invalid token
      return <Navigate to="/login" replace />;
    }
  }

  // If no token, redirect to login
  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // If role doesn't match allowed roles, redirect to appropriate page
  if (!allowedRoles.includes(userRole)) {
    if (userRole === "admin") {
      return <Navigate to="/analytics-page" replace />;
    } else if (userRole === "lecturer") {
      return <Navigate to="/home-lecturer" replace />;
    } else {
      return <Navigate to="/logged-home" replace />;
    }
  }

  // If authenticated and role matches, render the component
  return <Component />;
};

export default ProtectedRoute;