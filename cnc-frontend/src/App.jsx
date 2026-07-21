import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import OrderPage from "./pages/OrderPage";
import HistoryPage from "./pages/HistoryPage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  // 🟢 TARUH DENGARAN STORAGE DI SINI
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Cek jika token atau role ditimpa oleh tab sebelah
      if (e.key === "token" || e.key === "role") {
        alert("🚨 Sesi login berubah di tab lain! Halaman akan dimuat ulang.");
        window.location.reload(); // Paksa reload agar state membaca localStorage terbaru
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Clean up event listener saat komponen unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes untuk Kasir */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Route>

      {/* Rute Admin: Tembak ke AdminPage yang sama untuk ketiga URL */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/master" element={<AdminPage />} />
          <Route path="/admin/daftar" element={<AdminPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  );
};

export default App;