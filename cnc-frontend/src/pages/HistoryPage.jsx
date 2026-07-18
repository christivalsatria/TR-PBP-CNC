import { useState, useEffect } from "react";
import api from "../services/api";

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryRecords = async () => {
      try {
        const response = await api.get("/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error(
          "Gagal terhubung ke API history, menampilkan replika data mockup:",
          error,
        );
        // Menyesuaikan detail tampilan dengan data mockup dokumen skenario SRS
        setTransactions([
          { id: "#001", date: "21-07-2026", time: "11:30 WIB", total: 53000 },
          { id: "#002", date: "22-07-2026", time: "16:30 WIB", total: 42000 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryRecords();
  }, []);

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold text-[#8C5A3C] flex items-center gap-2">
        ⏳ RIWAYAT TRANSAKSI
      </h2>

      {isLoading ? (
        <p className="text-sm text-slate-500 font-medium">
          Sinkronisasi data riwayat...
        </p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition"
            >
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Transaksi {tx.id}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {tx.date} • {tx.time}
                </p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-[#8C5A3C] text-base">
                  Rp {tx.total.toLocaleString("id-ID")}
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