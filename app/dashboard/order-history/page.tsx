"use client";
import { useEffect, useState } from "react";

interface Order {
  _id: string;
  products: { name: string; price: number; quantity: number }[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  stripeSessionId?: string;
  stripeRedirectUrl?: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setError("Unauthorized: No token found.");

        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrRefund = async (order: Order) => {
    const confirmMsg =
      order.paymentStatus === "Paid"
        ? "Do you want to request a refund for this order?"
        : "Are you sure you want to cancel this pending order?";
    if (!window.confirm(confirmMsg)) return;

    const token = localStorage.getItem("token");
    if (!token) return setError("Unauthorized: No token found.");

    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to update order");

      alert(
        order.paymentStatus === "Paid" ? "Refund requested!" : "Order canceled!"
      );

      setOrders((prev) =>
        prev
          ? order.paymentStatus === "Paid"
            ? prev.map((o) => (o._id === order._id ? { ...o, paymentStatus: "Refunded" } : o))
            : prev.filter((o) => o._id !== order._id)
          : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleCompletePayment = async (order: Order) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in to continue.");

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: order.products }),
      });

      const data = await res.json();
      if (!res.ok || !data.sessionUrl || !data.sessionId) {
        throw new Error(data.error || "Stripe session creation failed.");
      }

      await fetch("/api/orders/update-session", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order._id,
          newSessionId: data.sessionId,
          newRedirectUrl: data.sessionUrl,
        }),
      });

      window.location.href = data.sessionUrl;
    } catch (err: any) {
      alert(err.message || "Could not complete payment");
    }
  };

  const filteredOrders = orders?.filter((o) =>
    statusFilter === "All" ? true : o.paymentStatus === statusFilter
  );

  return (
    <div className="p-6 max-w-5xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {loading && <p className="text-gray-600">Loading your orders...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="statusFilter" className="font-medium text-black">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-black bg-white"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {filteredOrders && filteredOrders.length > 0 ? (
        <ul className="space-y-6">
          {filteredOrders.map((order) => (
            <li
              key={order._id}
              className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
            >
              <div className="mb-3 space-y-1">
                <p className="font-semibold">Order ID: {order._id}</p>
                <p className="text-sm text-gray-700">
                  Date: {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  Total: <strong>${order.totalAmount.toFixed(2)}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      order.paymentStatus === "Paid"
                        ? "text-blue-600"
                        : order.paymentStatus === "Refunded"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="font-medium mb-2">Items:</p>
                <ul className="space-y-1 text-sm text-gray-800">
                  {order.products.map((p, i) => (
                    <li key={i}>
                      {p.quantity} × {p.name} - ${p.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                {order.paymentStatus === "Pending" && (
                  <>
                    <button
                      onClick={() => handleCompletePayment(order)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                    >
                      Complete Payment
                    </button>
                    <button
                      onClick={() => handleCancelOrRefund(order)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {order.paymentStatus === "Paid" && (
                  <button
                    onClick={() => handleCancelOrRefund(order)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Request Refund
                  </button>
                )}

                {order.paymentStatus === "Refunded" && (
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium">
                    Refunded
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">You don’t have any orders yet.</p>
      )}
    </div>
  );
}
