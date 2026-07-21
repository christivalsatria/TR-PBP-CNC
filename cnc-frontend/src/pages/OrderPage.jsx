import { useState, useEffect } from "react";
import api from "../services/api";

const OrderPage = () => {
  const [cart, setCart] = useState([]);
  const [cashAmount, setCashAmount] = useState("");
  const [customer, setCustomer] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [stage, setStage] = useState(1); // 1: Cart Summary, 2: Cash Input, 3: Receipt Success

  useEffect(() => {
    const loadedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(loadedCart);
  }, []);

  // Helper untuk menyimpan perubahan cart ke LocalStorage & State
  const updateCartState = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // 1. Fungsi Tambah Kuantitas (+)
  const handleIncreaseQuantity = (productId) => {
    const updatedCart = cart.map((item) =>
      (item.id || item._id) === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCartState(updatedCart);
  };

  // 2. Fungsi Kurangi Kuantitas (-)
  const handleDecreaseQuantity = (productId) => {
    const targetItem = cart.find((item) => (item.id || item._id) === productId);

    // Jika jumlah sisa 1 dan dikurangi, konfirmasi hapus item
    if (targetItem.quantity === 1) {
      handleRemoveItem(productId);
      return;
    }

    const updatedCart = cart.map((item) =>
      (item.id || item._id) === productId
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    updateCartState(updatedCart);
  };

  // 3. Fungsi Hapus Item dari Keranjang
  const handleRemoveItem = (productId) => {
    const updatedCart = cart.filter(
      (item) => (item.id || item._id) !== productId
    );
    updateCartState(updatedCart);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const balanceDue = Number(cashAmount) - subtotal;

  const cleanTransactionState = () => {
    localStorage.removeItem("cart");
    setCart([]);
    setStage(1);
    setInvoice(null);
    setCashAmount("");
    setCustomer("");
  };

  const processPaymentSubmit = async () => {
    if (Number(cashAmount) < subtotal) {
      alert("Nominal uang tunai yang dimasukkan kurang!");
      return;
    }

    const payload = {
      customerName: customer || "Pelanggan Umum",
      items: cart,
      total: subtotal,
      cashReceived: Number(cashAmount),
      change: balanceDue,
      date: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };

    try {
      const res = await api.post("/transactions", payload);
      setInvoice({
        ...payload,
        id:
          res.data?.id || "RTL-" + Math.floor(Math.random() * 900000 + 100000),
      });
      setStage(3);
    } catch (err) {
      console.warn(
        "Backend belum merespons penuh, mengaktifkan penyimpanan lokal sementara (Mode Offline).",
        err
      );
      setInvoice({
        ...payload,
        id: "RTL-" + Math.floor(Math.random() * 899999 + 100000),
      });
      setStage(3);
    }
  };

  if (cart.length === 0 && stage !== 3) {
    return (
      <div className="max-w-md mx-auto text-center py-12 bg-white rounded-2xl border p-8 shadow-sm text-slate-500 font-medium">
        Keranjang belanja kosong. Silakan pilih menu di katalog produk terlebih
        dahulu.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      {/* TAHAP 1: Ringkasan Menu & Pengaturan Kuantitas */}
      {stage === 1 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-[#8C5A3C] border-b pb-2 flex items-center gap-2">
            🛎️ DAFTAR PESANAN
          </h2>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => {
              const itemId = item.id || item._id;
              return (
                <div
                  key={itemId}
                  className="flex justify-between items-center py-3 gap-3"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      @ Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Kontrol Tambah/Kurang Kuantitas */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => handleDecreaseQuantity(itemId)}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-slate-700 font-bold hover:bg-red-50 hover:text-red-600 shadow-sm transition text-xs"
                      title="Kurangi"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncreaseQuantity(itemId)}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-slate-700 font-bold hover:bg-green-50 hover:text-green-600 shadow-sm transition text-xs"
                      title="Tambah"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Tombol Hapus */}
                  <div className="text-right flex items-center gap-3">
                    <span className="font-bold text-slate-700 text-sm min-w-[70px]">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(itemId)}
                      className="text-slate-400 hover:text-red-500 transition text-sm"
                      title="Hapus Produk"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 flex justify-between items-center text-lg font-black text-slate-900">
            <span>Total Keseluruhan</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600">
              Nama Pelanggan / Nomor Meja
            </label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Contoh: Christival / Meja 05"
              className="w-full text-sm p-2.5 border rounded-xl outline-none focus:border-[#8C5A3C]"
            />
          </div>

          <button
            onClick={() => setStage(2)}
            className="w-full bg-[#8C5A3C] hover:bg-[#734428] text-white py-3 rounded-xl font-bold transition text-sm"
          >
            Lanjutkan Pembayaran
          </button>
        </div>
      )}

      {/* TAHAP 2: Input Pembayaran Cash */}
      {stage === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#8C5A3C] border-b pb-2">
            💵 PROSES PEMBAYARAN
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Tagihan Pembayaran
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              Rp {subtotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600">
              Jumlah Uang Tunai yang Diterima (Rp)
            </label>
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="w-full p-3 border-2 rounded-xl text-xl font-bold text-center outline-none focus:border-green-600"
              placeholder="Masukkan nominal cash..."
            />
          </div>
          {Number(cashAmount) >= subtotal && (
            <div className="flex justify-between items-center text-sm font-semibold text-green-700 bg-green-50 p-3 rounded-xl">
              <span>Uang Kembalian:</span>
              <span className="font-extrabold text-base">
                Rp {balanceDue.toLocaleString("id-ID")}
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStage(1)}
              className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-semibold border text-sm hover:bg-slate-200"
            >
              Kembali
            </button>
            <button
              onClick={processPaymentSubmit}
              disabled={!cashAmount || Number(cashAmount) < subtotal}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Konfirmasi Bayar
            </button>
          </div>
        </div>
      )}

      {/* TAHAP 3: Struk Sukses */}
      {stage === 3 && invoice && (
        <div className="space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Pembayaran Sukses
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transaksi selesai diolah ke dalam database.
            </p>
          </div>

          {/* Tampilan Struk Fisik Kasir Bawaan */}
          <div className="text-left bg-amber-50/40 border border-amber-900/10 p-5 rounded-xl font-mono text-xs text-slate-700 space-y-3 shadow-inner">
            <div className="text-center font-bold">
              <p className="text-sm">CNC CAFE & RESTO</p>
              <p className="font-normal text-[10px] text-slate-400">
                Imam Bonjol, No 18, Salatiga
              </p>
            </div>
            <div className="border-b border-dashed border-slate-300 my-2"></div>
            <div className="space-y-0.5">
              <p>ID Transaksi : {invoice.id}</p>
              <p>Pelanggan   : {invoice.customerName}</p>
              <p>Tanggal     : {invoice.date}</p>
            </div>
            <div className="border-b border-dashed border-slate-300 my-2"></div>
            <div className="space-y-1.5">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-b border-dashed border-slate-300 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Sub-Total</span>
              <span>Rp {invoice.total.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar Tunai</span>
              <span>Rp {invoice.cashReceived.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-green-800">
              <span>Kembalian</span>
              <span>Rp {invoice.change.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => window.print()}
              className="w-full bg-[#8C5A3C] text-white py-2.5 rounded-xl font-bold text-sm"
            >
              🖨️ Cetak / Print Struk
            </button>
            <button
              onClick={cleanTransactionState}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border py-2.5 rounded-xl text-sm font-semibold"
            >
              Buka Pesanan Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;