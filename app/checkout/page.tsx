"use client";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!name || !email || !address) {
      alert("Please fill all fields.");
      return;
    }

    // Simulate payment process
    setTimeout(() => {
      setPaymentSuccess(true);
      clearCart(); // Clear the cart after successful checkout
    }, 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {paymentSuccess ? (
        <div className="text-green-600">
          <h2 className="text-xl font-bold">Payment Successful! 🎉</h2>
          <p>Thank you for your purchase, {name}!</p>
          <Link href="/" className="text-blue-500 mt-4 block">Go Back to Home</Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li key={item._id} className="border p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-green-500 font-bold">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <h2 className="text-xl font-bold">Total: ${totalAmount.toFixed(2)}</h2>
          </div>

          <div className="mt-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-2 border rounded mb-2"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2 border rounded mb-2"
            />
            <input 
              type="text" 
              placeholder="Shipping Address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="w-full p-2 border rounded mb-4"
            />

            <button 
              onClick={handleCheckout} 
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Confirm & Pay
            </button>
          </div>
        </>
      )}
    </div>
  );
}
