// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Kalau belum ada token → tendang ke /login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Kalau ada token → render children (Dashboard, Budgets, dll)
  return children;
}
