"use client";
import { useEffect, useState } from "react";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  status: string;
  service: string;
  stylist: string;
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/user/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.statusText}`);

      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to cancel");

      alert("Appointment cancelled.");
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert("Failed to cancel appointment.");
    }
  };

  const getStatusStyle = (status: string) => {
    const base = "bg-opacity-20 text-black";
    switch (status) {
      case "Scheduled":
        return `bg-blue-200 ${base}`;
      case "Completed":
        return `bg-green-200 ${base}`;
      case "Cancelled":
        return `bg-red-200 ${base}`;
      default:
        return `bg-yellow-200 ${base}`;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-black mb-6">My Appointments</h1>

      {loading && <p className="text-gray-600">Loading your appointments...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {appointments.length === 0 && !loading && (
        <p className="text-gray-600">You don't have any appointments yet.</p>
      )}

      <div className="grid gap-6 mt-6">
        {appointments.map((a) => (
          <div
            key={a._id}
            className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-black mb-2">{a.service}</h2>
            <div className="text-sm text-gray-800 space-y-1">
              <p>
                <span className="font-medium">Stylist:</span> {a.stylist}
              </p>
              <p>
                <span className="font-medium">Date & Time:</span> {a.date} at {a.time}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                    a.status
                  )}`}
                >
                  {a.status}
                </span>
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => handleCancel(a._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
