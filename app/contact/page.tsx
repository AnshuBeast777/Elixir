"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert("Please fill all fields.");
      return;
    }
    // Optional: Send data to backend API
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section className="bg-gradient-to-b from-[#f5ebff] to-white min-h-screen px-6 py-16 text-black">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-start">
        {/* Left - Contact Form */}
        <div>
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

          {submitted && (
            <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded shadow">
              Thank you! We’ll get back to you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Message</label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Type your message..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Right - Map + Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Our Location</h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.9133794089945!2d-73.98955078459337!3d40.74844017932716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259af18e1a1ab%3A0xf54c86e5061720ac!2sEmpire%20State%20Building!5e0!3m2!1sen!2sca!4v1649064034876!5m2!1sen!2sca"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="rounded-lg shadow"
            ></iframe>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-sm space-y-2">
            <p><span className="font-semibold">Address:</span> 123 Main Street, New York, NY 10001</p>
            <p><span className="font-semibold">Phone:</span> (123) 456-7890</p>
            <p><span className="font-semibold">Email:</span> info@elixir.com</p>
          </div>
        </div>
      </div>
    </section>
  );
}
