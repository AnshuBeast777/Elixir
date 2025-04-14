"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { Search, ShoppingCart, X } from "lucide-react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { addToCart, cart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [search, sort, products]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const highlightMatch = (text: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <section className="bg-gradient-to-b from-[#f5ebff] to-white min-h-screen px-4 py-12 text-black">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Elixir Shop</h1>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg py-2 pl-10 pr-10 text-sm text-black"
            />
            {search && (
              <X
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-black"
              />
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm text-black"
          >
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        {paginatedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex flex-col text-black"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-cover rounded-lg mb-4"
                />
                <h2 className="text-lg font-semibold mb-1">
                  {highlightMatch(product.name)}
                </h2>
                <p className="text-gray-700 text-sm mb-2">{product.description}</p>
                <p className="text-purple-600 font-bold mb-3">
                  ${product.price.toFixed(2)}
                </p>

                <button
                  onClick={() => addToCart(product)}
                  className="mt-auto bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 mt-20">
            No products found for{" "}
            <span className="font-semibold">{`"${search}"`}</span>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-purple-600 text-white"
                    : "bg-white border text-purple-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Icon - now on the left side */}
      <Link
        href="/cart"
        className="fixed bottom-6 left-6 bg-purple-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 hover:bg-purple-700 transition"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-bold text-sm">{cart.length}</span>
      </Link>
    </section>
  );
}
