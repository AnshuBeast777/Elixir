"use client";

import { useEffect, useState } from "react";

interface Service {
  _id: string;
  name: string;
  price: number;
  description: string;
  duration: number;
}

export default function AdminServicePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    duration: "",
    _id: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `/api/admin/services/${form._id}`
      : "/api/admin/services";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          description: form.description,
          duration: Number(form.duration),
        }),
      });

      const data = res.headers.get("content-type")?.includes("application/json")
        ? await res.json()
        : null;

      if (res.ok) {
        alert(data?.message || "Service saved");
        setForm({ name: "", price: "", description: "", duration: "", _id: "" });
        setIsEditing(false);
        fetchServices();
      } else {
        alert(data?.message || "Error saving service");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network error");
    }
  };

  const handleEdit = (service: Service) => {
    setForm({
      name: service.name,
      price: service.price.toString(),
      description: service.description,
      duration: service.duration.toString(),
      _id: service._id,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      alert(data.message || "Deleted");
      fetchServices();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5ebff] to-white px-6 py-10 text-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Service Manager</h1>

        <div className="mb-10 bg-white border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Service" : "Add Service"}
          </h2>
          <input
            type="text"
            name="name"
            placeholder="Service Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price (e.g. 50)"
            value={form.price}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded"
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration in minutes (e.g. 30)"
            value={form.duration}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded"
          />
          <textarea
            name="description"
            placeholder="Service Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            {isEditing ? "Update Service" : "Create Service"}
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">All Services</h2>
        {services.length === 0 ? (
          <p className="text-gray-600">No services found.</p>
        ) : (
          <ul className="space-y-4">
            {services.map((s) => (
              <li
                key={s._id}
                className="bg-white border p-4 rounded-xl shadow flex justify-between items-start"
              >
                <div>
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <p className="text-sm text-gray-600">${s.price}</p>
                  <p className="text-sm text-gray-700">{s.description}</p>
                  <p className="text-sm text-gray-500 italic">{s.duration} min</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
