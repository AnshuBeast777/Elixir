"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, CalendarDays, Clock, User } from "lucide-react";

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
}

interface Stylist {
  _id: string;
  name: string;
  specialization?: string;
}

export default function BookNowPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [bookedStylistIds, setBookedStylistIds] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    serviceId: "",
    date: "",
    time: "",
    stylistId: "",
    paymentMethod: "in-person",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data.services || []);
    };

    const fetchStylists = async () => {
      const res = await fetch("/api/stylists");
      const data = await res.json();
      setStylists(data.stylists || []);
    };

    fetchServices();
    fetchStylists();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!form.date || !form.time) return;
      const res = await fetch(`/api/public/availability?date=${form.date}&time=${form.time}`);
      const data = await res.json();
      setBookedStylistIds(data.bookedStylistIds || []);
    };

    fetchAvailability();
  }, [form.date, form.time]);

  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "3:00 PM", "4:00 PM"];

  const handleNext = () => {
    if (step === 1 && !form.serviceId) return alert("Please select a service");
    if (step === 2 && (!form.date || !form.time)) return alert("Please select date & time");
    if (step === 3 && !form.stylistId) return alert("Please select a stylist");
    setStep((prev) => prev + 1);
  };

  const handleBook = async () => {
    if (!token) return alert("Please login to book");

    try {
      const endpoint =
        form.paymentMethod === "online" ? "/api/appointments/checkout" : "/api/appointments";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      if (form.paymentMethod === "online" && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        alert("Appointment booked successfully!");
        router.push("/dashboard/appointments");
      }
    } catch (err: any) {
      alert("Booking failed: " + err.message);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f3e8ff] to-white px-4 py-16">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-3xl font-bold text-black text-center mb-8">
          Book Your Appointment
        </h2>

        {step === 1 && (
          <>
            <h3 className="text-xl font-semibold text-black mb-4">Select Service</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {services.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setForm({ ...form, serviceId: s._id })}
                  className={`flex justify-between items-center p-4 rounded-lg border transition ${
                    form.serviceId === s._id
                      ? "border-purple-600 bg-purple-50 shadow-md"
                      : "border-gray-200 hover:border-purple-400"
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-lg text-black">{s.name}</h4>
                    <p className="text-sm text-gray-800">
                      {s.duration} min • ${s.price}
                    </p>
                  </div>
                  <Scissors className="text-purple-600" />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-xl font-semibold text-black mb-4">Select Date & Time</h3>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full mb-4 p-2 border rounded text-black"
            />
            <div className="grid grid-cols-2 gap-3">
              {times.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, time: t })}
                  className={`flex items-center gap-2 justify-center border p-2 rounded text-black ${
                    form.time === t
                      ? "bg-purple-100 border-purple-600 font-semibold"
                      : "hover:border-purple-400"
                  }`}
                >
                  <Clock size={16} /> {t}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-xl font-semibold text-black mb-4">Select Stylist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {stylists.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setForm({ ...form, stylistId: s._id })}
                  disabled={bookedStylistIds.includes(s._id)}
                  className={`flex justify-between items-center p-4 rounded-lg border transition ${
                    form.stylistId === s._id
                      ? "border-purple-600 bg-purple-50 shadow-md"
                      : "border-gray-200 hover:border-purple-400"
                  } ${
                    bookedStylistIds.includes(s._id) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-lg text-black">{s.name}</h4>
                    <p className="text-sm text-gray-800">{s.specialization || "General"}</p>
                  </div>
                  <User className="text-purple-600" />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="text-xl font-semibold text-black mb-4">Booking Summary</h3>
            <ul className="text-gray-800 space-y-2 mb-6">
              <li><strong>Service ID:</strong> {form.serviceId}</li>
              <li><strong>Date:</strong> {form.date}</li>
              <li><strong>Time:</strong> {form.time}</li>
              <li><strong>Stylist ID:</strong> {form.stylistId}</li>
              <li><strong>Payment:</strong> {form.paymentMethod}</li>
            </ul>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full mb-4 p-2 border rounded text-black"
            >
              <option value="in-person">Pay at Salon</option>
              <option value="online">Pay Online (Stripe)</option>
            </select>
          </>
        )}

        <div className="flex gap-4 justify-end mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleBook}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
