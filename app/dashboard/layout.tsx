"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isAuthenticated === null) {
    return <p className="text-center mt-10 text-lg text-gray-600">Checking authentication...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile Menu Toggle Button */}
      <button
        className="absolute top-4 left-4 z-50 md:hidden bg-purple-600 text-white px-4 py-2 rounded shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        Menu
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed md:relative md:w-64 bg-gray-900 text-white p-6 space-y-4 shadow-lg transition-transform duration-300 z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:min-h-screen`}
      >
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`block px-4 py-2 rounded ${
                pathname === "/dashboard" ? "bg-purple-700" : "hover:bg-gray-700"
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/appointments"
              className={`block px-4 py-2 rounded ${
                pathname === "/dashboard/appointments" ? "bg-purple-700" : "hover:bg-gray-700"
              }`}
            >
              My Appointments
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/order-history"
              className={`block px-4 py-2 rounded ${
                pathname === "/dashboard/order-history" ? "bg-purple-700" : "hover:bg-gray-700"
              }`}
            >
              Order History
            </Link>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white px-4 py-2 mt-10 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-64 transition-all duration-300">{children}</main>
    </div>
  );
};

export default DashboardLayout;
