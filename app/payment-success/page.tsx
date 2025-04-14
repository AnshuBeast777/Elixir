"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useCart } from "@/app/context/CartContext";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [hasClearedCart, setHasClearedCart] = useState(false);
  const [hasMounted, setHasMounted] = useState(false); // fix hydration mismatch

  useEffect(() => {
    setHasMounted(true); // Mark component as mounted to safely use window
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setError("No session ID found.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You must be logged in to view your order.");

        const res = await fetch(`/api/orders/success?session_id=${sessionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch order.");

        setOrder(data.order);

        // Clear cart only once
        if (!hasClearedCart) {
          clearCart();
          setHasClearedCart(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, clearCart, hasClearedCart]);

  useEffect(() => {
    if (order && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      router.push("/dashboard/order-history");
    }
  }, [order, countdown, router]);

  return (
    <div className="p-6 text-center bg-white shadow-md rounded-lg max-w-lg mx-auto mt-10 relative">
      {/* Render Confetti only after mount */}
      {order && hasMounted && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}

      <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
      <p className="mt-2 text-gray-600">Thank you for your purchase. Your order is confirmed.</p>

      {loading ? (
        <p className="mt-4 text-gray-500">Loading order details...</p>
      ) : error ? (
        <p className="mt-4 text-red-500">{error}</p>
      ) : order ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">Order Details</h2>
          <p className="text-sm text-gray-500 mt-1">Order ID: {order._id}</p>
          <ul className="mt-3 text-gray-600 text-left">
            {order.products.map((item: any, index: number) => (
              <li key={index} className="flex justify-between border-b py-2">
                <span>{item.name}</span>
                <span>
                  ${item.price} x {item.quantity}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-bold text-lg text-gray-900 mt-4">
            Total: ${order.totalAmount}
          </p>
          <p className="text-gray-700 mt-1">
            Status: <span className="font-semibold">{order.paymentStatus}</span>
          </p>
        </div>
      ) : (
        <p className="mt-4 text-red-500">No order details found.</p>
      )}

      <p className="mt-4 text-gray-500 font-semibold text-lg">
        Redirecting to your orders in{" "}
        <span className="text-blue-500">{countdown}</span> second{countdown !== 1 ? "s" : ""}... <br />
        Or{" "}
        <a href="/dashboard/order-history" className="text-blue-500 underline">
          click here
        </a>{" "}
        to go now.
      </p>

      <a
        href="/dashboard/order-history"
        className="mt-6 inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        View My Orders
      </a>
    </div>
  );
}
