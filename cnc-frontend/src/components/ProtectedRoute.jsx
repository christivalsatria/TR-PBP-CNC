import React from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  // Ubah localStorage menjadi sessionStorage
  const token = sessionStorage.getItem("token");

  // Jika token tidak ada, tendang user kembali ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada, izinkan mengakses halaman di dalamnya
  return <Outlet />;
};

export default ProtectedRoute;