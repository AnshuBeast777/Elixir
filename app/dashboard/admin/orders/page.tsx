"use client";

import { useEffect, useState } from "react";

interface Order {
  _id: string;
  userId: string;
  stripeSessionId: string;
  totalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Refunded";
  createdAt: string;
  products: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setOrders(data.orders || []);
    setFiltered(data.orders || []);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const result = orders.filter((order) =>
      order.userId.toLowerCase().includes(search.toLowerCase()) ||
      order.paymentStatus.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, orders]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleCancelOrRefund = async (order: Order) => {
    const confirmText =
      order.paymentStatus === "Pending"
        ? "Are you sure you want to delete this pending order?"
        : "Are you sure you want to refund this paid order?";
    if (!window.confirm(confirmText)) return;

    const res = await fetch(`/api/admin/orders/${order._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    alert(data.message);
    fetchOrders();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6">Admin Order Manager</h1>

      <input
        type="text"
        placeholder="Search by user ID or payment status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {currentOrders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <>
          <ul className="space-y-5">
            {currentOrders.map((order) => (
              <li key={order._id} className="border rounded-xl shadow p-5 bg-white">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Order ID:</span> {order._id}</p>
                    <p><span className="font-semibold">User:</span> {order.userId}</p>
                    <p className="text-gray-500">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-xl font-bold">${order.totalAmount.toFixed(2)}</p>
                    <p
                      className={`text-sm font-semibold ${
                        order.paymentStatus === "Paid"
                          ? "text-green-600"
                          : order.paymentStatus === "Pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </p>
                    {(order.paymentStatus === "Pending" || order.paymentStatus === "Paid") && (
                      <button
                        onClick={() => handleCancelOrRefund(order)}
                        className="mt-2 bg-red-500 text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 transition"
                      >
                        {order.paymentStatus === "Pending" ? "Cancel" : "Refund"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3 text-sm">
                  <p className="font-medium mb-1">Products:</p>
                  {order.products.map((product) => (
                    <p key={product._id} className="text-gray-700">
                      • {product.name} × {product.quantity} (${product.price.toFixed(2)})
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
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
  );
}
