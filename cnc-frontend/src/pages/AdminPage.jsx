import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import api from "../services/api";

const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getFullYear(), week: weekNo };
};

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

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [productId, setProductId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handlePositiveNumber = (value, setter) => {
    if (value === "") {
      setter("");
      return;
    }
    const numValue = Math.max(0, Number(value));
    setter(numValue);
  };

  useEffect(() => {
    if (location.pathname === "/admin/daftar") {
      fetchProducts();
    } else if (
      location.pathname === "/admin/history" ||
      location.pathname === "/admin"
    ) {
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

  const weeklySummary = calculateWeeklySummary(transactions);

  return (
    <>
      {/* REKAP MINGGUAN */}
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
                  onClick={() => setSelectedTx(tx)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition cursor-pointer hover:border-[#8C5A3C]/30"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      Transaksi {tx.transactionId}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pelanggan: {tx.customerName || "General Customer"} • Kasir:{" "}
                      {tx.cashierName || "Kasir CNC"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      ,{" "}
                      {new Date(tx.createdAt).toLocaleTimeString("id-ID", {
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

      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h2 className="text-xl font-black text-slate-800">
                Detail Transaksi
              </h2>
              <p className="text-xs text-slate-400">
                Stok telah terpotong dan transaksi tersimpan.
              </p>
            </div>

            <div id="printablereceipt" className="bg-[#FFFDF9] border border-amber-900/10 p-5 rounded-2xl font-mono text-xs text-slate-700 space-y-3 shadow-inner">
              <div className="text-center font-bold space-y-0.5">
                <p className="text-sm tracking-wide">CNC CAFE & RESTO</p>
                <p className="font-normal text-[10px] text-slate-400">
                  Imam Bonjol, No 18, Salatiga
                </p>
              </div>

              <div className="border-b border-dashed border-slate-300 my-2"></div>

              <div className="space-y-1 text-[11px]">
                <p>
                  <span className="inline-block w-24">ID Transaksi</span>:{" "}
                  {selectedTx.transactionId}
                </p>
                <p>
                  <span className="inline-block w-24">Pelanggan</span>:{" "}
                  {selectedTx.customerName || "General Customer"}
                </p>
                <p>
                  <span className="inline-block w-24">Meja</span>:{" "}
                  {selectedTx.tableNumber || "-"}
                </p>
                <p>
                  <span className="inline-block w-24">Kasir</span>:{" "}
                  {selectedTx.cashierName || "Kasir CNC"}
                </p>
              </div>

              <div className="border-b border-dashed border-slate-300 my-2"></div>

              <div className="space-y-1.5">
                {selectedTx.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.nameAtTransaction || item.name} (x{item.quantity})
                    </span>
                    <span>
                      Rp{" "}
                      {(
                        (item.priceAtTransaction || item.price) * item.quantity
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-300 my-2"></div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Sub-Total</span>
                  <span>
                    Rp {selectedTx.totalAmount?.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar Tunai</span>
                  <span>
                    Rp {selectedTx.amountPaid?.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Kembalian</span>
                  <span>Rp {selectedTx.change?.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.print()}
                className="w-full bg-[#8C5A3C] hover:bg-[#734428] text-white py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                🖨️ Cetak / Print Struk
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-3 rounded-xl text-sm font-semibold transition"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;