"use client";
import { useEffect, useState } from "react";

interface Stylist {
  _id: string;
  name: string;
  bio?: string;
  specialization?: string;
}

export default function AdminStylistPage() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [form, setForm] = useState({
    _id: "",
    name: "",
    bio: "",
    specialization: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchStylists = async () => {
    try {
      const res = await fetch("/api/admin/stylists", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to fetch stylists");

      setStylists(data.stylists || []);
    } catch (err) {
      alert("Something went wrong while fetching stylists.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchStylists();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/admin/stylists/${form._id}`
        : "/api/admin/stylists";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          specialization: form.specialization,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save stylist");
        return;
      }

      alert(data.message);
      setForm({ _id: "", name: "", bio: "", specialization: "" });
      setIsEditing(false);
      fetchStylists();
    } catch (err) {
      alert("Failed to submit stylist.");
      console.error(err);
    }
  };

  const handleEdit = (stylist: Stylist) => {
    setForm({
      _id: stylist._id,
      name: stylist.name,
      bio: stylist.bio || "",
      specialization: stylist.specialization || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this stylist?")) return;

    try {
      const res = await fetch(`/api/admin/stylists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert(data.message);
      fetchStylists();
    } catch (err) {
      alert("Failed to delete stylist.");
      console.error(err);
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStylists = stylists.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(stylists.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5ebff] to-white px-6 py-10 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Stylist Manager</h1>

        <div className="mb-10 bg-white border rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Stylist" : "Add Stylist"}
          </h2>

          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded"
          />
          <input
            name="specialization"
            placeholder="Specialization"
            value={form.specialization}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded"
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            {isEditing ? "Update Stylist" : "Create Stylist"}
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">All Stylists</h2>
        {stylists.length === 0 ? (
          <p className="text-gray-600">No stylists found.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {currentStylists.map((s) => (
                <li
                  key={s._id}
                  className="bg-white border p-4 rounded-xl shadow flex justify-between items-start"
                >
                  <div>
                    <p className="text-lg font-bold">{s.name}</p>
                    {s.specialization && (
                      <p className="text-sm text-gray-600">Specialty: {s.specialization}</p>
                    )}
                    {s.bio && <p className="text-sm text-gray-700 mt-1">{s.bio}</p>}
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

            {/* Pagination controls */}
            <div className="mt-6 flex justify-between items-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                ⬅ Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next ➡
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
