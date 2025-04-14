"use client";

import { useState } from "react";

type GalleryItem = {
  id: number;
  category: "Men" | "Women" | "Color" | "Bridal";
  src: string;
};

const galleryItems: GalleryItem[] = [
  { id: 1, category: "Bridal", src: "/gallery/bridal1.jpg" },
  { id: 2, category: "Bridal", src: "/gallery/bridal2.jpg" },
  { id: 3, category: "Bridal", src: "/gallery/bridal3.jpg" },
  { id: 4, category: "Women", src: "/gallery/women1.jpg" },
  { id: 5, category: "Women", src: "/gallery/women2.jpg" },
  { id: 6, category: "Women", src: "/gallery/women3.jpg" },
  { id: 7, category: "Women", src: "/gallery/women4.jpg" },
  { id: 8, category: "Women", src: "/gallery/women5.jpg" },
  { id: 9, category: "Women", src: "/gallery/women6.jpg" },
  { id: 10, category: "Women", src: "/gallery/women7.jpg" },
  { id: 11, category: "Color", src: "/gallery/color1.jpg" },
  { id: 12, category: "Color", src: "/gallery/color2.jpg" },
  { id: 13, category: "Color", src: "/gallery/color3.jpg" },
  { id: 14, category: "Color", src: "/gallery/color4.jpg" },
  { id: 15, category: "Color", src: "/gallery/color5.jpg" },
  { id: 16, category: "Color", src: "/gallery/color6.jpg" },
  { id: 17, category: "Men", src: "/gallery/men1.jpg" },
  { id: 18, category: "Men", src: "/gallery/men2.jpg" },
  { id: 19, category: "Men", src: "/gallery/men3.jpg" },
  { id: 20, category: "Men", src: "/gallery/men4.jpg" },
  { id: 21, category: "Men", src: "/gallery/men5.jpg" },
  { id: 22, category: "Men", src: "/gallery/men6.jpg" },
];

const categories = ["All", "Men", "Women", "Color", "Bridal"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <section className="bg-gradient-to-b from-[#f5ebff] to-white min-h-screen px-4 py-16 text-black">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Gallery</h1>

        {/* Category Buttons */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-purple-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 bg-white"
            >
              <img
                src={item.src}
                alt={item.category}
                className="w-full h-auto aspect-[4/5] object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-opacity duration-300" />
              <div className="absolute bottom-2 left-2 text-white text-sm font-medium bg-purple-600 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {item.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
