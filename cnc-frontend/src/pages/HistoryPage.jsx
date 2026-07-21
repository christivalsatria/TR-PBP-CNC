import { useState, useEffect } from "react";
import api from "../services/api";

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null); // State untuk menyimpan transaksi yang dipilih untuk struk

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/transactions/history");
        setTransactions(response.data);
      } catch (error) {
        console.error("Gagal mengambil riwayat transaksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold text-[#8C5A3C] flex items-center gap-2">
        ⏳ RIWAYAT TRANSAKSI
      </h2>

      {isLoading ? (
        <p className="text-sm text-slate-500 font-medium">Memuat riwayat...</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx._id || tx.transactionId}
              onClick={() => setSelectedTx(tx)} // Set transaksi aktif saat diklik
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

      {/* MODAL STRUK DETAIL TRANSAKSI */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Header Sukses */}
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

            {/* Tampilan Struk Fisik */}
            <div className="bg-[#FFFDF9] border border-amber-900/10 p-5 rounded-2xl font-mono text-xs text-slate-700 space-y-3 shadow-inner">
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

              {/* Daftar Item Pembelian */}
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

              {/* Ringkasan Pembayaran */}
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

            {/* Tombol Aksi */}
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
    </div>
  );
};

export default HistoryPage;