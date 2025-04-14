"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Service = {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="bg-gradient-to-b from-[#f5ebff] to-white min-h-screen px-4 py-20">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center mb-12 text-black"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Services
        </motion.h2>

        {loading ? (
          <p className="text-center text-gray-800">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-800">No services available.</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            {services.map((service) => (
              <motion.div
                key={service._id}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer p-6 flex flex-col justify-between transition-all duration-300"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">{service.name}</h3>
                  <p className="text-gray-800 mb-4 line-clamp-3">{service.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
                    <span className="text-purple-700 font-semibold text-lg">
                      ${service.price}
                    </span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <Clock size={16} /> {service.duration} min
                    </span>
                  </div>
                </div>

                <Link
                  href={`/book?id=${service._id}`}
                  className="mt-auto bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-lg font-semibold transition duration-300 block"
                >
                  Book Now
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
