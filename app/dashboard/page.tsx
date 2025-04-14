"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center md:items-start bg-gradient-to-br from-purple-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard</h1>

      {loading ? (
        <p className="text-gray-500">Loading your profile...</p>
      ) : user ? (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md w-full max-w-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Information</h2>
          <p className="text-gray-700 mb-1">
            <span className="font-medium">Name:</span> {user.name}
          </p>
          <p className="text-gray-700 mb-1">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Role:</span> {user.role}
          </p>
        </div>
      ) : (
        <p className="text-red-500">Failed to load user info.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        <Link href="/dashboard/appointments">
          <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition-all text-lg">
            My Appointments
          </button>
        </Link>
        <Link href="/dashboard/order-history">
          <button className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition-all text-lg">
            Order History
          </button>
        </Link>
      </div>
    </div>
  );
}
