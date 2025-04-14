"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Book Now", href: "/book" },
  { name: "Gallery", href: "/gallery" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-purple-600 text-xl font-bold flex items-center gap-2">
          <span className="border-2 border-purple-600 rounded-full p-1 text-lg">+</span>
          Elixir
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`font-medium ${
                pathname === link.href
                  ? "text-purple-700 underline underline-offset-4"
                  : "text-purple-600 hover:text-purple-800"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/account" className="text-purple-600 hover:text-purple-800">
            <User />
          </Link>
          <Link href="/cart" className="text-purple-600 hover:text-purple-800">
            <ShoppingCart />
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-purple-600"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 pb-6 pt-2 space-y-4 text-purple-600">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium ${
                pathname === link.href ? "text-purple-800 font-bold underline underline-offset-4" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/account" className="block" onClick={() => setIsOpen(false)}>
            My Account
          </Link>
          <Link href="/cart" className="block" onClick={() => setIsOpen(false)}>
            Cart
          </Link>
        </div>
      )}
    </header>
  );
}
