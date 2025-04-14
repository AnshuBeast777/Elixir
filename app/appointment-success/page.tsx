"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AppointmentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    setStatus("success");

    const timeout = setTimeout(() => {
      router.push("/dashboard/appointments");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-10 max-w-md w-full text-center text-white shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-white mb-4" />
              <h2 className="text-lg font-semibold animate-pulse">Verifying your payment...</h2>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">Appointment Confirmed!</h2>
              <p className="mb-4">Your payment was successful. Thank you for booking with us!</p>
              <p className="text-sm text-gray-300">Redirecting to your dashboard...</p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-500 mb-2">Payment Failed</h2>
              <p className="mb-4">Something went wrong. Please contact support if needed.</p>
              <button
                onClick={() => router.push("/dashboard/appointments")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition duration-200"
              >
                Go to Appointments
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
