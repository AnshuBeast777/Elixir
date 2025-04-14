"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error("Unauthorized");

        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <div className="text-center py-20 text-black">Loading...</div>;

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center px-4 py-20">
      <div className="bg-white border border-purple-100 shadow-xl rounded-2xl p-8 w-full max-w-xl text-black">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-700">My Account</h1>

        <div className="space-y-4 text-lg">
          <p>
            <span className="font-semibold"> Name:</span> {user?.name}
          </p>
          <p>
            <span className="font-semibold"> Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-semibold"> Role:</span> {user?.role}
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded-full font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
}
