import { useState, useEffect } from "react";
import api from "../services/api";

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Panggil endpoint /transactions/history
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
  );
};

export default HistoryPage;