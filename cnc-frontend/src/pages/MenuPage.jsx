import { useState, useEffect } from "react";
import api from "../services/api";

const MenuPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Gagal memuat produk dari API, memuat data lokal:", error);
      // Fallback produk sesuai visual mockup prototipe halaman menu CNC
      setProducts([
        {
          id: "1",
          name: "Mochi",
          price: 18000,
          category: "Makanan",
          image:
            "https://images.unsplash.com/photo-1542841791-1925403a436f?w=400",
        },
        {
          id: "2",
          name: "Cheesecake",
          price: 18000,
          category: "Makanan",
          image:
            "https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=400",
        },
        {
          id: "3",
          name: "Mille Crepes",
          price: 15000,
          category: "Makanan",
          image:
            "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
        },
        {
          id: "4",
          name: "Matcha Latte",
          price: 22000,
          category: "Minuman",
          image:
            "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400",
        },
        {
          id: "5",
          name: "Caramel Macchiato",
          price: 20000,
          category: "Minuman",
          image:
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400",
        },
        {
          id: "6",
          name: "Taro Frappe",
          price: 18000,
          category: "Minuman",
          image:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToOrder = (product) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const targetIndex = currentCart.findIndex((item) => item.id === product.id);

    if (targetIndex > -1) {
      currentCart[targetIndex].quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    alert(`${product.name} dimasukkan ke daftar pesanan sementara.`);
  };

  const displayProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      category === "Semua" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Kontrol */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Cari menu makanan atau minuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#8C5A3C] transition shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          {["Semua", "Makanan", "Minuman"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                category === cat
                  ? "bg-[#8C5A3C] text-white shadow-md"
                  : "bg-white text-[#8C5A3C] border border-[#8C5A3C]/30 hover:bg-[#8C5A3C]/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Katalog */}
      {isLoading ? (
        <div className="text-center py-12 font-medium text-[#8C5A3C]">
          Menghubungkan ke server...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-slate-100 flex flex-col"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-44 object-cover bg-slate-50"
              />
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[#8C5A3C] font-bold text-sm mt-0.5">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  onClick={() => handleAddToOrder(product)}
                  className="w-full bg-[#8C5A3C] hover:bg-[#734428] text-white py-2 rounded-xl text-xs font-bold transition"
                >
                  + Tambah Pesanan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;