import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State untuk data user kasir
  const [userData, setUserData] = useState({ username: "Kasir", role: "Kasir" });

  useEffect(() => {
    // Ambil data dari sessionStorage
    const savedUser = sessionStorage.getItem("user");
    const savedRole = sessionStorage.getItem("role");

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserData({
          username: parsed.username || parsed.name || "Kasir",
          role: savedRole || parsed.role || "Kasir",
        });
      } catch (e) {
        console.error("Gagal parse data user:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin keluar dari kasir?");
    if (konfirmasi) {
      // Bersihkan sessionStorage saat logout
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-[#FAF6F0] text-slate-800 font-sans">
      {/* SIDEBAR KASIR */}
      <aside className="w-64 bg-[#8C5A3C] text-amber-50 flex flex-col justify-between shadow-xl shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-[#713f27]">
              CNC
            </div>
            <span className="font-bold text-lg tracking-wider">CNC KASIR</span>
          </div>

          <nav className="mt-6 px-3 space-y-1">
            <Link
              to="/menu"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition ${
                location.pathname === "/menu"
                  ? "bg-amber-100 text-[#713f27] font-bold shadow-md"
                  : "hover:bg-white/10 text-amber-100/80 hover:text-white"
              }`}
            >
              <span>📋</span> Daftar Menu
            </Link>

            <Link
              to="/order"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition ${
                location.pathname === "/order"
                  ? "bg-amber-100 text-[#713f27] font-bold shadow-md"
                  : "hover:bg-white/10 text-amber-100/80 hover:text-white"
              }`}
            >
              <span>🛒</span> Keranjang Pesanan
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition ${
                location.pathname === "/history"
                  ? "bg-amber-100 text-[#713f27] font-bold shadow-md"
                  : "hover:bg-white/10 text-amber-100/80 hover:text-white"
              }`}
            >
              <span>📜</span> Riwayat Transaksi
            </Link>
          </nav>
        </div>

        {/* FOOTER SIDEBAR KASIR */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="text-xs text-amber-200/60 mb-1">Kasir Aktif:</div>
          <div className="font-semibold text-sm truncate text-white mb-2">
            {userData.username}
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-700/80 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs font-semibold transition"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;