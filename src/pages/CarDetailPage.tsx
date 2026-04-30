import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import type { Car } from "../types";
import {
  Calendar,
  Gauge,
  Zap,
  ArrowLeft,
  Share2,
  Heart,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCar() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching car:", error);
      } else if (data) {
        setCar({
          id: data.id,
          make: data.make,
          model: data.model,
          year: data.year,
          price: data.price,
          mileage: data.mileage,
          fuelType: data.fuel_type,
          bodyType: data.body_type,
          imageUrl: data.image_url,
          isNewArrival: data.is_new_arrival,
          isCertified: data.is_certified,
          isEditorsChoice: data.is_editors_choice,
          description: data.description,
        });
      }
      setLoading(false);
    }

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
        <p className="font-bold text-secondary uppercase tracking-widest text-xs">
          Mengambil Detail Kendaraan...
        </p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black mb-2">
            Kendaraan Tidak Ditemukan
          </h2>
          <p className="text-secondary text-sm mb-8">
            Kendaraan yang Anda cari mungkin sudah terjual atau tidak tersedia
            lagi di inventaris kami.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { label: "Tahun", value: car.year, icon: Calendar },
    {
      label: "Kilometer",
      value: `${car.mileage.toLocaleString()} km`,
      icon: Gauge,
    },
    { label: "Jenis Bahan Bakar", value: car.fuelType, icon: Zap },
    { label: "Tipe Bodi", value: car.bodyType || "Sedan", icon: ChevronRight },
    { label: "Transmisi", value: "Otomatis", icon: Info },
    {
      label: "Status Inventaris",
      value: car.isCertified ? "Tersertifikasi" : "Bekas",
      icon: Info,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Inventaris
          </Link>

          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100">
              <Heart className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Konten Utama (Kiri) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galeri Gambar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[16/10] bg-white rounded-[2.5rem] overflow-hidden shadow-premium group"
            >
              <img
                src={car.imageUrl}
                alt={car.model}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Detail Konten */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-baseline gap-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-gray-100 text-black rounded-full">
                  LSTNG #{car.id.split("-")[0].toUpperCase()}
                </span>
                {car.isNewArrival && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200">
                    Baru Tiba
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 leading-none">
                {car.year} {car.make} <br />
                <span className="text-gray-300">{car.model}</span>
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 py-10 border-y border-gray-100">
                {specs.map((spec, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <spec.icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {spec.label}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-black">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="pt-10 space-y-6">
                <h3 className="text-2xl font-black tracking-tight">
                  Deskripsi Kendaraan
                </h3>
                <p className="text-secondary leading-relaxed font-medium">
                  {car.description ||
                    "Kendaraan ini merupakan puncak dari performa dan kemewahan. Dirawat dengan cermat dan baru-baru ini diperiksa, memberikan pengalaman berkendara yang tiada duanya. Hubungi spesialis produk kami untuk detail lebih lanjut atau jadwalkan kunjungan pribadi."}
                </p>

                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest">
                        Garansi 12-Bulan
                      </p>
                      <p className="text-xs text-secondary mt-1">
                        Perlindungan penuh
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest">
                        Pemeriksaan Bersertifikat
                      </p>
                      <p className="text-xs text-secondary mt-1">
                        150+ poin teknis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Harga & CTA (Kanan) */}
          <div className="space-y-6 ">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-gray-100">
                <div className="mb-10">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] block mb-2">
                    Harga Resmi
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-5xl font-black tracking-tighter">
                      Rp{car.price.toLocaleString()}
                    </h2>
                    <span className="text-xs text-secondary font-bold uppercase tracking-widest">
                      IDR
                    </span>
                  </div>
                  <p className="text-[10px] text-green-600 font-bold mt-4 flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-200" />
                    Siap Dibeli
                  </p>
                </div>

                <div className="space-y-4">
                  <Link
                    to={`/booking/${car.id}`}
                    className="block w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-center text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                  >
                    Mulai Booking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CarDetailPage;
