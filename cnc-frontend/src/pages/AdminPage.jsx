import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import api from "../services/api";

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Form Tambah Produk (Master Produk)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock || !category) {
      alert("Semua field wajib diisi!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Produk berhasil ditambahkan!");
      setName("");
      setPrice("");
      setStock("");
      setCategory("");
      setImageFile(null);
      
      fetchProducts();
      navigate("/admin/daftar"); // Alihkan rute URL ke daftar stok setelah sukses
    } catch (error) {
      console.error("Gagal menambah produk:", error);
      alert("Gagal menambahkan produk.");
    }
  };

  return (
    <>
      {/* CONDITIONAL CONTENT 1: REKAP MINGGUAN (/admin) */}
      {location.pathname === "/admin" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-[#713f27] mb-5 flex items-center gap-2">
            📊 Weekly Summary (Rekap Mingguan)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF6F0] text-[#713f27] font-bold border-b border-slate-200">
                  <th className="p-4 text-sm">Tahun</th>
                  <th className="p-4 text-sm">Minggu Ke-</th>
                  <th className="p-4 text-sm">Total Transaksi</th>
                  <th className="p-4 text-sm">Total Pendapatan (Omzet)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="p-4 text-sm font-medium">2026</td>
                  <td className="p-4 text-sm text-slate-600">Minggu ke-28</td>
                  <td className="p-4 text-sm text-slate-600">4 Transaksi</td>
                  <td className="p-4 text-sm font-bold text-[#8C5A3C]">Rp 228,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONDITIONAL CONTENT 2: MASTER PRODUK (/admin/master) */}
      {location.pathname === "/admin/master" && (
        <div className="max-w-2xl bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-[#713f27] mb-6 flex items-center gap-2">
            ➕ Master Produk (Tambah Menu Baru)
          </h2>
          <form onSubmit={handleSignProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#713f27] mb-1">Nama Produk</label>
              <input
                type="text"
                placeholder="Masukkan nama produk baru"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] transition shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#713f27] mb-1">Harga</label>
                <input
                  type="number"
                  placeholder="Rp"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] transition shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#713f27] mb-1">Stok Awal</label>
                <input
                  type="number"
                  placeholder="Pcs"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#713f27] mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] text-slate-700 transition shadow-sm"
              >
                <option value="">Pilih Kategori</option>
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#713f27] mb-1">Foto Produk</label>
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#FAF6F0] file:text-[#8C5A3C] hover:file:bg-[#8C5A3C]/10 transition file:cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#8C5A3C] hover:bg-[#734428] text-white font-bold py-3 rounded-xl shadow-md transition-colors mt-6"
            >
              Simpan Ke Database
            </button>
          </form>
        </div>
      )}

      {/* CONDITIONAL CONTENT 3: DAFTAR PRODUK & STOK (/admin/daftar) */}
      {location.pathname === "/admin/daftar" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-[#713f27] mb-6 flex items-center gap-2">
            📦 Daftar Produk & Stok Menu
          </h2>

          {isLoading ? (
            <div className="text-center py-12 text-[#8C5A3C] font-medium animate-pulse">
              Menghubungkan ke database...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada data produk yang ditemukan di server.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF6F0] text-[#713f27] font-bold border-b border-slate-200">
                    <th className="p-4 text-sm">Gambar</th>
                    <th className="p-4 text-sm">Nama Menu</th>
                    <th className="p-4 text-sm">Kategori</th>
                    <th className="p-4 text-sm text-center">Sisa Stok</th>
                    <th className="p-4 text-sm">Harga Jual</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <img
                          src={
                            prod.image && prod.image.startsWith("/uploads")
                              ? `http://localhost:5000${prod.image}`
                              : prod.image || "https://placehold.co/45x45?text=No+Img"
                          }
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shadow-sm"
                        />
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-800">{prod.name}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          prod.category === "Makanan" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-center text-slate-700">{prod.stock} Pcs</td>
                      <td className="p-4 text-sm font-bold text-[#8C5A3C]">
                        Rp {prod.price ? prod.price.toLocaleString("id-ID") : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPage;