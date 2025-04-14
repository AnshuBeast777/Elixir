"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/dashboard/admin/analytics", label: "Analytics" },
  { href: "/dashboard/admin/appointments", label: "Appointments" },
  { href: "/dashboard/admin/orders", label: "Orders" },
  { href: "/dashboard/admin/products", label: "Products" },
  { href: "/dashboard/admin/services", label: "Services" },
  { href: "/dashboard/admin/schedules", label: "Stylist Schedules" },
  { href: "/dashboard/admin/stylists", label: "Stylists" },
  { href: "/dashboard/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 bg-white border-r shadow-sm p-4 md:sticky md:top-0 md:h-screen z-20">
        <div className="flex justify-between items-center md:block">
          <h2 className="text-xl font-bold mb-4 text-black">Admin Panel</h2>
          <button
            onClick={() => setShowSidebar((prev) => !prev)}
            className="md:hidden text-gray-600"
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className={`mt-4 space-y-2 ${!showSidebar ? "hidden md:block" : ""}`}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`block px-4 py-2 rounded-lg font-medium cursor-pointer transition ${
                  pathname === link.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-100"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6 min-h-screen">{children}</main>
    </div>
  );
}
