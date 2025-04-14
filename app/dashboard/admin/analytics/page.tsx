"use client";
import { useEffect, useState } from "react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalClients: number;
  totalProducts: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchAnalytics = async () => {
    const res = await fetch("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5ebff] to-white px-6 py-10 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Dashboard Analytics</h1>

        {stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold mb-1">Total Revenue</h2>
              <p className="text-2xl font-bold text-blue-700">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold mb-1">Total Orders</h2>
              <p className="text-2xl font-bold text-blue-700">{stats.totalOrders}</p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold mb-1">Total Clients</h2>
              <p className="text-2xl font-bold text-blue-700">{stats.totalClients}</p>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow hover:shadow-md transition">
              <h2 className="text-lg font-semibold mb-1">Total Products</h2>
              <p className="text-2xl font-bold text-blue-700">{stats.totalProducts}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading analytics...</p>
        )}
      </div>
    </div>
  );
}
