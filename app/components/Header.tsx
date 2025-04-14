"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, User, ShoppingCart } from "lucide-react"
import Logo from "./Logo"

export default function Header() {
  // State to manage mobile menu open/close status
  const [isOpen, setIsOpen] = useState(false)
  // State to track if the user has scrolled down the page
  const [scrolled, setScrolled] = useState(false)
  
  // Get the current pathname to highlight the active page
  const pathname = usePathname()

  // Effect to check if the user has scrolled down the page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Navigation links
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Book Now", path: "/book-now" },
    { name: "Gallery", path: "/gallery" },
    { name: "Shop", path: "/shop" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-transparent"}`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="text-2xl font-bold text-purple-800">Elixir</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-lg font-medium ${
                  pathname === item.path ? "text-purple-600" : scrolled ? "text-purple-800" : "text-white"
                } hover:text-purple-600 transition-colors`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Icons for Account & Cart */}
          <div className="hidden md:flex space-x-4">
            <Link
              href="/account"
              className={`${scrolled ? "text-purple-800" : "text-white"} hover:text-purple-600 transition-colors`}
            >
              <User />
            </Link>
            <Link
              href="/cart"
              className={`${scrolled ? "text-purple-800" : "text-white"} hover:text-purple-600 transition-colors`}
            >
              <ShoppingCart />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-purple-800" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md">
            <div className="flex flex-col space-y-4 py-4 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`text-purple-800 hover:text-purple-600 transition-colors ${
                    pathname === item.path ? "font-bold" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Additional links in mobile menu */}
              <Link
                href="/account"
                className="text-purple-800 hover:text-purple-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
              <Link
                href="/cart"
                className="text-purple-800 hover:text-purple-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Cart
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
