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
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "role") {
        alert("🚨 Sesi login berubah di tab lain! Halaman akan dimuat ulang.");
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/master" element={<AdminPage />} />
          <Route path="/admin/daftar" element={<AdminPage />} />
          <Route path="/admin/history" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  );
};

export default App;