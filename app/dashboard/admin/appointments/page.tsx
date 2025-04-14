"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Appointment {
  _id: string;
  clientName?: string;
  clientEmail?: string;
  stylistName?: string;
  stylistSpecialization?: string;
  serviceName?: string;
  price?: number;
  duration?: number;
  date: string;
  time: string;
  status?: "Scheduled" | "Completed" | "Cancelled";
  isPaid?: boolean;
  paymentStatus?: "Pending" | "Paid" | "Failed";
}

export default function AdminAppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const itemsPerPage = 5;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/admin/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAppointments(data.appointments || []);
      setFiltered(data.appointments || []);
    } catch (err) {
      toast.error("Failed to fetch appointments.");
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status updated!");
        fetchAppointments();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      toast.error("Error updating status.");
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Appointment deleted.");
        fetchAppointments();
      } else {
        toast.error("Failed to delete appointment.");
      }
    } catch (err) {
      toast.error("Error deleting appointment.");
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const result = appointments.filter((a) => {
      const fields = [
        a.clientName || "",
        a.clientEmail || "",
        a.stylistName || "",
        a.stylistSpecialization || "",
        a.serviceName || "",
        a.status || "",
        new Date(a.date).toLocaleDateString(),
        a.time || "",
        a.paymentStatus || "",
      ];
      return fields.some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFiltered(result);
    setCurrentPage(1);
  }, [search, appointments]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAppointments = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  return (
    <div className="p-6 max-w-6xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6">Admin Appointments</h1>

      <input
        type="text"
        placeholder="Search by client, stylist, or service..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {currentAppointments.length === 0 ? (
        <p className="text-gray-500 text-center">No appointments found.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {currentAppointments.map((a) => (
              <li key={a._id} className="border bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Service:</span> {a.serviceName || "N/A"}{" "}
                      {a.price ? `($${a.price})` : ""}{" "}
                      {a.duration ? `- ${a.duration} mins` : ""}
                    </p>
                    <p>
                      <span className="font-medium">Client:</span> {a.clientName || "N/A"}{" "}
                      {a.clientEmail && <span className="text-gray-500">({a.clientEmail})</span>}
                    </p>
                    <p>
                      <span className="font-medium">Stylist:</span> {a.stylistName || "N/A"}{" "}
                      {a.stylistSpecialization && (
                        <span className="text-gray-500">({a.stylistSpecialization})</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Appointment:</span> {a.date} at {a.time}
                    </p>
                    <p>
                      <span className="font-medium">Payment Status:</span>{" "}
                      <span
                        className={`font-semibold ${
                          a.paymentStatus === "Paid"
                            ? "text-green-600"
                            : a.paymentStatus === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {a.paymentStatus || "Unknown"}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <select
                      disabled={loadingId === a._id}
                      value={a.status}
                      onChange={(e) => updateStatus(a._id, e.target.value)}
                      className="px-3 py-2 text-sm border rounded focus:outline-none"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      disabled={loadingId === a._id}
                      onClick={() => deleteAppointment(a._id)}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="mt-8 flex justify-between items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
