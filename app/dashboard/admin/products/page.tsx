"use client";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

export default function AdminProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [form, setForm] = useState({
    _id: "",
    name: "",
    price: "",
    image: "",
    description: "",
    stock: "",
  });
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data.products || []);
    setFiltered(data.products || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const result = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/admin/products/${form._id}` : "/api/admin/products";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        image: form.image,
        description: form.description,
        stock: Number(form.stock),
      }),
    });

    const data = await res.json();
    alert(data.message);
    setForm({ _id: "", name: "", price: "", image: "", description: "", stock: "" });
    setIsEditing(false);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setForm({
      _id: product._id,
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      description: product.description,
      stock: product.stock.toString(),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    alert(data.message);
    fetchProducts();
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5ebff] to-white py-10 px-4 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Product Manager</h1>

        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="mb-10 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Product" : "Add Product"}
          </h2>
          <div className="space-y-4">
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
            <input
              name="image"
              placeholder="Image URL"
              value={form.image}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
            <input
              name="stock"
              type="number"
              placeholder="Stock Quantity"
              value={form.stock}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
            <button
              onClick={handleSubmit}
              className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
            >
              {isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">All Products</h2>
        {currentProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products available.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {currentProducts.map((p) => (
                <li
                  key={p._id}
                  className="bg-white border rounded-xl shadow p-4 flex justify-between items-start"
                >
                  <div>
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <p className="text-sm text-gray-600">Price: ${p.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Stock: {p.stock}</p>
                    <p className="text-sm mt-1">{p.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-400 text-white px-4 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="mt-8 flex justify-between items-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
