"use client";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to continue.");
        return;
      }

      if (!cart || cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });

      const paymentData = await paymentRes.json();
      const sessionId = paymentData?.sessionId;
      const sessionUrl = paymentData?.sessionUrl;

      if (!paymentRes.ok || !sessionId || !sessionUrl) {
        throw new Error(paymentData.error || "Missing Stripe session info.");
      }

      const orderRes = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart, totalAmount, sessionId }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || "Failed to save order.");
      }

      window.location.href = sessionUrl;
    } catch (err: any) {
      console.error("Checkout Error:", err);
      alert(err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5ebff] to-white py-16 px-4 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Cart</h1>

        {cart.length === 0 ? (
          <p className="text-center text-gray-600">
            Your cart is empty.{" "}
            <Link href="/shop" className="text-purple-600 hover:underline font-medium">
              Continue Shopping
            </Link>
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {cart.map((item) => (
                <li
                  key={item._id}
                  className="border bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-black">{item.name}</h2>
                      <p className="text-purple-600 font-bold">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border rounded text-sm bg-gray-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="ml-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex justify-between items-center">
              <h2 className="text-xl font-bold">Total: ${totalAmount.toFixed(2)}</h2>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                {loading ? "Processing..." : "Proceed to Checkout"}
              </button>

              <button
                onClick={clearCart}
                className="w-full sm:w-auto bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
