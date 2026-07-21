import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import api from "../services/api";

// Helper untuk menghitung nomor minggu (ISO Week Number)
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getFullYear(), week: weekNo };
};

// Helper untuk mengelompokkan transaksi berdasarkan minggu & tahun
const calculateWeeklySummary = (transactionsList) => {
  const summaryMap = {};

  transactionsList.forEach((tx) => {
    if (!tx.createdAt) return;
    const { year, week } = getWeekNumber(tx.createdAt);
    const key = `${year}-W${week}`;

    if (!summaryMap[key]) {
      summaryMap[key] = {
        year,
        week,
        totalTransactions: 0,
        totalOmzet: 0,
      };
    }

    summaryMap[key].totalTransactions += 1;
    summaryMap[key].totalOmzet += tx.totalAmount || 0;
  });

  return Object.values(summaryMap).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.week - a.week;
  });
};

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Khusus Riwayat Transaksi & Rekap
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // State Form Tambah & Edit Produk (Master Produk)
  const [isEdit, setIsEdit] = useState(false);
  const [productId, setProductId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Helper untuk memastikan nilai input angka tidak minus
  const handlePositiveNumber = (value, setter) => {
    if (value === "") {
      setter("");
      return;
    }
    const numValue = Math.max(0, Number(value));
    setter(numValue);
  };

  // Efek untuk mendeteksi rute aktif
  useEffect(() => {
    if (location.pathname === "/admin/daftar") {
      fetchProducts();
    } else if (
      location.pathname === "/admin/history" ||
      location.pathname === "/admin"
    ) {
      // Ambil riwayat transaksi baik di halaman Rekap maupun Halaman History
      fetchTransactions();
    }

    if (location.pathname === "/admin/master" && location.state?.editProduct) {
      const prod = location.state.editProduct;
      setIsEdit(true);
      setProductId(prod._id);
      setName(prod.name);
      setPrice(prod.price);
      setStock(prod.stock);
      setCategory(prod.category);
    } else if (location.pathname === "/admin/master") {
      resetForm();
    }
  }, [location]);

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

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const response = await api.get("/transactions/history");
      setTransactions(response.data);
    } catch (error) {
      console.error("Gagal mengambil riwayat transaksi:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setProductId(null);
    setName("");
    setPrice("");
    setStock("");
    setCategory("");
    setImageFile(null);
  };

  // HANDLER SUBMIT (Bisa Tambah Baru atau Update Produk)
  const handleSignProduct = async (e) => {
    e.preventDefault();

    if (!name || price === "" || stock === "" || !category) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      alert("Harga dan stok tidak boleh kurang dari 0!");
      return;
    }

    const konfirmasi = window.confirm(
      isEdit
        ? `Apakah Anda yakin ingin memperbarui data menu "${name}"?`
        : `Apakah Anda yakin ingin menambahkan menu baru "${name}"?`
    );
    if (!konfirmasi) return;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEdit) {
        await api.put(`/products/${productId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(`Berhasil! Data menu "${name}" telah diperbarui.`);
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(`Berhasil! Menu baru "${name}" telah ditambahkan.`);
      }

      resetForm();
      fetchProducts();
      navigate("/admin/daftar");
    } catch (error) {
      console.error("Gagal memproses produk:", error);
      alert(isEdit ? "Gagal memperbarui produk." : "Gagal menambahkan produk.");
    }
  };

  const handleEditClick = (prod) => {
    navigate("/admin/master", { state: { editProduct: prod } });
  };

  const handleDeleteClick = async (id, namaMenu) => {
    const konfirmasiHapus = window.confirm(
      `🚨 PERINGATAN!\n\nApakah Anda yakin ingin MENGHAPUS menu "${namaMenu}" secara permanen dari database?`
    );
    if (!konfirmasiHapus) return;

    try {
      await api.delete(`/products/${id}`);
      alert(`Sukses! Menu "${namaMenu}" telah dihapus secara permanen.`);
      fetchProducts();
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      alert("Gagal menghapus produk dari server.");
    }
  };

  // Kalkulasi rekap mingguan secara langsung
  const weeklySummary = calculateWeeklySummary(transactions);

  return (
    <>
      {/* 🟢 CONDITIONAL CONTENT 1: REKAP MINGGUAN DINAMIS (/admin) */}
      {location.pathname === "/admin" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-[#713f27] flex items-center gap-2">
              📊 Weekly Summary (Rekap Mingguan)
            </h2>
            <button
              onClick={fetchTransactions}
              className="bg-[#8C5A3C] hover:bg-[#713f27] text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
            >
            Refresh
            </button>
          </div>

          {isLoadingTransactions ? (
            <div className="text-center py-12 text-[#8C5A3C] font-medium animate-pulse">
              Menghitung rekap transaksi mingguan...
            </div>
          ) : weeklySummary.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Belum ada data transaksi yang dapat direkap.
            </div>
          ) : (
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
                  {weeklySummary.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition"
                    >
                      <td className="p-4 text-sm font-medium text-slate-800">
                        {item.year}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        Minggu ke-{item.week}
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-semibold">
                        {item.totalTransactions} Transaksi
                      </td>
                      <td className="p-4 text-sm font-bold text-[#8C5A3C]">
                        Rp {item.totalOmzet.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONDITIONAL CONTENT 2: MASTER PRODUK (/admin/master) */}
      {location.pathname === "/admin/master" && (
        <div className="max-w-2xl bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#713f27] flex items-center gap-2">
              {isEdit ? "✏️ Edit Produk Menu" : "➕ Master Produk (Tambah Menu Baru)"}
            </h2>
            {isEdit && (
              <button
                onClick={() => {
                  resetForm();
                  navigate("/admin/master");
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSignProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#713f27] mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                placeholder="Masukkan nama produk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] transition shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#713f27] mb-1">
                  Harga
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Rp"
                  value={price}
                  onChange={(e) => handlePositiveNumber(e.target.value, setPrice)}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#713f27] mb-1">
                  {isEdit ? "Sesuaikan Stok" : "Stok Awal"}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Pcs"
                  value={stock}
                  onChange={(e) => handlePositiveNumber(e.target.value, setStock)}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#713f27] mb-1">
                Kategori
              </label>
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
              <label className="block text-sm font-bold text-[#713f27] mb-1">
                Foto Produk{" "}
                {isEdit && (
                  <span className="text-xs font-normal text-slate-400">
                    (Biarkan kosong jika tidak ingin ganti foto)
                  </span>
                )}
              </label>
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
              {isEdit ? "Simpan Perubahan" : "Simpan Ke Database"}
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
                    <th className="p-4 text-sm text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr
                      key={prod._id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition"
                    >
                      <td className="p-4">
                        <img
                          src={
                            prod.image && prod.image.startsWith("/uploads")
                              ? `http://localhost:5000${prod.image}`
                              : prod.image ||
                                "https://placehold.co/45x45?text=No+Img"
                          }
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shadow-sm"
                        />
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-800">
                        {prod.name}
                      </td>
                      <td className="p-4 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            prod.category === "Makanan"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-center text-slate-700">
                        {prod.stock} Pcs
                      </td>
                      <td className="p-4 text-sm font-bold text-[#8C5A3C]">
                        Rp {prod.price ? prod.price.toLocaleString("id-ID") : 0}
                      </td>
                      <td className="p-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg font-medium text-xs transition shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prod._id, prod.name)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg font-medium text-xs transition shadow-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONDITIONAL CONTENT 4: RIWAYAT TRANSAKSI (/admin/history) */}
      {location.pathname === "/admin/history" && (
        <div className="space-y-6 max-w-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#8C5A3C] flex items-center gap-2">
              ⏳ RIWAYAT TRANSAKSI
            </h2>
            <button
              onClick={fetchTransactions}
              className="bg-[#8C5A3C] hover:bg-[#713f27] text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm"
            >
            Refresh
            </button>
          </div>

          {isLoadingTransactions ? (
            <p className="text-sm text-slate-500 font-medium">
              Memuat riwayat...
            </p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-slate-400">
              Belum ada riwayat transaksi yang tercatat.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx._id || tx.transactionId}
                  className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Transaksi {tx.transactionId}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pelanggan: {tx.customerName} • Kasir: {tx.cashierName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[#8C5A3C] text-base block">
                      Rp {tx.totalAmount?.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {tx.items?.length || 0} item
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPage;