import { Outlet, Link, useLocation, useNavigate } from "react-router";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // Navigasi khusus Admin yang mengarah ke sub-route /admin/...
  const navigation = [
    { name: "Rekap Mingguan", path: "/admin", icon: "📊" },
    { name: "Master Produk", path: "/admin/master", icon: "➕" },
    { name: "Daftar Produk", path: "/admin/daftar", icon: "📦" },
  ];

  return (
    <div className="flex h-screen bg-[#8C5A3C]/10 text-slate-800">
      {/* Sidebar Kiri Permanen Admin */}
      <aside className="w-64 bg-[#8C5A3C] text-amber-50 flex flex-col justify-between shadow-xl">
        <div>
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-[#8C5A3C]">
              CNC
            </div>
            <span className="font-bold text-lg tracking-wider">
              CNC ADMIN
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-6 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-amber-100 text-[#8C5A3C] shadow-md font-bold"
                      : "hover:bg-white/10 text-amber-100/80 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sesi Identitas Pengguna */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="text-xs text-amber-200/60 mb-1">Akses Level:</div>
          <div className="font-semibold text-sm truncate uppercase">
            {role} CNC
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-red-700/80 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs font-semibold transition"
          >
            Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* Area Utama Konten */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;