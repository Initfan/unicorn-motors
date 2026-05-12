import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import AdminSidebar from "../components/AdminSidebar";
import {
  Car as CarIcon,
  Search,
  ShieldCheck,
  ChevronRight,
  Edit2,
  Trash2,
} from "lucide-react";
import type { Car } from "../types";
import UpdateInventoryModal from "../components/UpdateStock";

function AdminInventoryPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCar, setEditCar] = useState<Car>(null);
  const [open, setOpen] = useState(false);
  const [updated, setUpdated] = useState<Car[]>([]);

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return console.error("Error fetching inventory:", error);

      setCars(data);

      setLoading(false);
    }

    fetchInventory();
  }, [updated]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
      <AdminSidebar />

      <UpdateInventoryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        car={editCar}
        updated={(car) => setUpdated((p) => [...p, car])}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-72 p-8 flex flex-col min-w-0">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">
              Inventaris Armada
            </h2>
            <p className="text-secondary text-sm font-medium">
              Kelola aset kendaraan Anda dan dokumentasi kepatuhan di semua
              wilayah.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatCard
            icon={CarIcon}
            label="Total Armada"
            value={cars.length.toLocaleString()}
            trend="+4.2%"
            trendUp
          />
          <StatCard
            icon={ShieldCheck}
            label="Tersedia untuk Dijual"
            value={Math.floor(cars.length * 0.8).toString()}
            label2="Tercatat di Marketplace Global"
          />
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-white rounded-[2.5rem] p-4 shadow-premium border border-gray-100 mb-10">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
              <input
                type="text"
                placeholder="Cari Nama Kendaraan, Plat atau Model..."
                className="w-full pl-12 pr-6 py-3 bg-gray-50/50 rounded-2xl text-sm focus:ring-2 focus:ring-black outline-none transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                Menampilkan 1-10 dari {cars.length} kendaraan
              </p>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                  <th className="px-8 py-4">Nama Kendaraan</th>
                  <th className="px-8 py-4">Nomor Rangka</th>
                  <th className="px-8 py-4">Stok</th>
                  <th className="px-8 py-4">Status Dokumen</th>
                  <th className="px-8 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-8 py-6" colSpan={5}>
                            <div className="h-10 bg-gray-50 rounded-lg" />
                          </td>
                        </tr>
                      ))
                  : cars.map((car) => (
                      <tr
                        key={car.id}
                        className="group hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-gray-100 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                              <img
                                src={car.image_url}
                                alt={car.model}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-black text-black leading-tight">
                                {car.year} {car.make} {car.model}
                              </p>
                              <p className="text-[10px] text-secondary font-bold uppercase tracking-tight mt-1">
                                {car.body_type} • {car.fuel_type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1.5 bg-gray-100 rounded text-[9px] font-mono font-bold text-secondary uppercase tracking-widest">
                            {car.vin}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black w-4">
                              {car.stock}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-2">
                            <span
                              className={`px-2 py-1 bg-green-50 text-green-600 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-green-100 ${!car.certified_stnk ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                            >
                              STNK{" "}
                              {car.certified_stnk ? "Valid" : "Tidak Valid"}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-blue-100 ${!car.certified_bpkb ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                            >
                              BPKB{" "}
                              {car.certified_bpkb
                                ? "Tersedia"
                                : "Tidak Tersedia"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right flex ">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => (setEditCar(car), setOpen(true))}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-secondary/60" />
                            </button>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => null}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-secondary/60" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  urgent,
  label2,
}: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-premium relative group hover:scale-[1.02] transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {trend}
          </span>
        )}
        {urgent && (
          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse border border-amber-100">
            12 Mendesak
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-1">
        {label}
      </p>
      <h3 className="text-3xl font-black tracking-tighter mb-2">{value}</h3>
      {label2 && (
        <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-tight">
          {label2}
        </p>
      )}
    </div>
  );
}

function ExpiryItem({ icon: Icon, label, desc, color }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-3xl border border-gray-50 hover:border-gray-100 hover:bg-gray-50/30 transition-all cursor-pointer group">
      <div className="flex items-center gap-6">
        <div
          className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="font-black text-sm mb-1">{label}</p>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-tight">
            {desc}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
    </div>
  );
}

export default AdminInventoryPage;
