"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { toast } from "react-hot-toast";

interface Schedule {
  _id: string;
  stylistId: string;
  stylistName?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [form, setForm] = useState({
    _id: "",
    stylistId: "",
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "17:00",
  });
  const [stylists, setStylists] = useState<{ _id: string; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sRes, styRes] = await Promise.all([
        fetch("/api/admin/schedules", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/stylists", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const sData = await sRes.json();
      const styData = await styRes.json();
      setSchedules(sData.schedules || []);
      setStylists(styData.stylists || []);
    } catch (err) {
      toast.error("Failed to load data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.stylistId) return toast.error("Please select a stylist.");
    if (form.startTime >= form.endTime) return toast.error("Start time must be before end time.");

    const conflict = schedules.some(
      (s) =>
        s.stylistId === form.stylistId &&
        s.dayOfWeek === form.dayOfWeek &&
        ((form.startTime >= s.startTime && form.startTime < s.endTime) ||
          (form.endTime > s.startTime && form.endTime <= s.endTime))
    );
    if (conflict) return toast.error("This schedule conflicts with an existing one.");

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/admin/schedules/${form._id}` : "/api/admin/schedules";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success(data.message);
      setForm({ _id: "", stylistId: "", dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00" });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      toast.error("Error saving schedule.");
      console.error(err);
    }
  };

  const handleEdit = (s: Schedule) => {
    setForm({
      _id: s._id,
      stylistId: s.stylistId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;

    try {
      const res = await fetch(`/api/admin/schedules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success(data.message);
      fetchData();
    } catch (err) {
      toast.error("Failed to delete schedule.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5ebff] to-white py-10 px-4 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Stylist Schedule Manager</h1>

        {loading && <p className="text-center text-gray-500 mb-4">Loading schedules...</p>}

        <div className="mb-10 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Schedule" : "Add Schedule"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              name="stylistId"
              value={form.stylistId}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Stylist</option>
              {stylists.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                )
              )}
            </select>

            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />

            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            {isEditing ? "Update Schedule" : "Create Schedule"}
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">All Schedules</h2>

        <ul className="space-y-4">
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center">No schedules found.</p>
          ) : (
            schedules.map((s) => (
              <li
                key={s._id}
                className="bg-white border rounded-xl shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-lg">
                    {stylists.find((sty) => sty._id === s.stylistId)?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {s.dayOfWeek} — {s.startTime} to {s.endTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="bg-yellow-400 text-white px-4 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
