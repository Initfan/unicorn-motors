import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import {
  CheckCircle2,
  FileText,
  Truck,
  UserCheck,
  Download,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

interface Booking {
  id: string;
  created_at: string;
  status: string;
  car: {
    make: string;
    model: string;
    year: number;
    image_url: string;
    price: number;
  };
}

function DashboardBookingsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          created_at,
          status,
          car:cars (
            make,
            model,
            year,
            image_url,
            price
          )
        `,
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
      } else if (data) {
        setBookings(data as any);
      }
      setLoading(false);
    }

    fetchBookings();
  }, []);

  const activeBookings = bookings.filter((b) => b.status !== "completed");
  const pastBookings = bookings.filter((b) => b.status === "completed");
  const displayedBookings =
    activeTab === "active" ? activeBookings : pastBookings;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Verification Pending",
          color: "bg-gray-100 text-gray-700",
        };
      case "verified":
        return { label: "Booking Verified", color: "bg-blue-50 text-blue-700" };
      case "dp_paid":
        return { label: "Deposit Paid", color: "bg-black text-white" };
      case "verified_dp":
        return {
          label: "Clearing Process",
          color: "bg-amber-50 text-amber-700",
        };
      case "completed":
        return { label: "Completed", color: "bg-green-50 text-green-700" };
      default:
        return {
          label: status.toUpperCase(),
          color: "bg-gray-100 text-gray-500",
        };
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tight mb-4 text-black">
            Pemesanan Anda
          </h1>
          <p className="text-secondary text-lg font-medium max-w-2xl leading-relaxed">
            Kelola reservasi kendaraan Anda saat ini, lacak kemajuan verifikasi,
            dan akses catatan transaksi historis untuk Unicorn Motors.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex bg-gray-50/80 p-1.5 rounded-2xl w-fit mb-12 shadow-inner">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "active"
                ? "bg-white text-black shadow-md"
                : "text-secondary hover:text-black"
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "past"
                ? "bg-white text-black shadow-md"
                : "text-secondary hover:text-black"
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-8 mb-24">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Sinkronisasi Catatan Armada
              </p>
            </div>
          ) : displayedBookings.length === 0 ? (
            <div className="py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
              <Calendar className="w-16 h-16 text-gray-300 mb-6" />
              <h3 className="text-2xl font-black tracking-tight mb-2">
                Tidak ada {activeTab} bookings ditemukan
              </h3>
              <p className="text-secondary text-sm font-medium mb-10 max-w-sm">
                Siap memulai perjalanan Anda? Jelajahi marketplace kami untuk
                menemukan akuisisi Anda berikutnya.
              </p>
              <Link
                to="/marketplace"
                className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Jelajahi Marketplace
              </Link>
            </div>
          ) : (
            displayedBookings.map((booking) => {
              const status = getStatusDisplay(booking.status);
              const formattedDate = new Date(
                booking.created_at,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-premium transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row gap-10">
                    {/* Car Image Preview */}
                    <div className="w-full lg:w-[400px] h-60 bg-gray-100 rounded-3xl overflow-hidden shadow-sm relative">
                      <img
                        src={booking.car.image_url}
                        alt={booking.car.model}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        {booking.status === "completed" && (
                          <div className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-black shadow-sm">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                          <h2 className="text-3xl font-black tracking-tighter mb-2 flex items-center gap-2">
                            {booking.car.year} {booking.car.make}{" "}
                            {booking.car.model}
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50" />
                          </h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-widest text-secondary/50">
                            <span>
                              ID: UNM-{booking.id.split("-")[0].toUpperCase()}
                            </span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span>Dipesan {formattedDate}</span>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest h-fit ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-10 lg:mt-0 flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-1">
                            {booking.status === "completed"
                              ? "Harga Mobil"
                              : "Biaya Booking"}
                          </p>
                          <p className="text-2xl font-black tracking-tight">
                            {booking.status === "completed"
                              ? "Rp" + booking.car.price.toLocaleString()
                              : "Rp" + (50e4).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {booking.status === "completed" ? (
                            <button className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-2 hover:bg-gray-50 transition-all">
                              <Download className="w-4 h-4" /> Unduh Invoice
                            </button>
                          ) : (
                            <>
                              <button className="text-[11px] font-black uppercase tracking-widest text-secondary hover:text-black transition-colors px-4">
                                Batal
                              </button>
                              <Link
                                to={`/dashboard/payment/${booking.id}`}
                                className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-xl"
                              >
                                Lihat Detail
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardBookingsPage;
