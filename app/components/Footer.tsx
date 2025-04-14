import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Branding */}
        <div>
          <h2 className="text-white text-xl font-bold mb-2">Elixir</h2>
          <p>Your destination for premium grooming and styling services.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><a href="/services" className="hover:text-white">Services</a></li>
            <li><a href="/book" className="hover:text-white">Book Now</a></li>
            <li><a href="/gallery" className="hover:text-white">Gallery</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-white font-semibold mb-2">Hours</h3>
          <ul className="space-y-1">
            <li>Monday - Friday: 9am - 8pm</li>
            <li>Saturday: 9am - 6pm</li>
            <li>Sunday: 10am - 5pm</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white font-semibold mb-2">Connect With Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white"><Twitter size={20} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
        © 2025 Elixir. All rights reserved.
      </div>
    </footer>
  );
}
