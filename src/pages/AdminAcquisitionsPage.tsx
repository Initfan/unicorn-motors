import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import AdminSidebar from "../components/AdminSidebar";
import {
  CheckCircle2,
  Eye,
  DollarSign,
  FileText,
  Truck,
  ArrowRight,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SellRequest {
  id: string;
  car_id: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  asking_price: number;
  condition_notes: string;
  negotiable: boolean;
  status: string;
  created_at: string;
  car: {
    make: string;
    model: string;
    year: number;
    price: number;
    image_url: string;
  };
}

function AdminAcquisitionsPage() {
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<SellRequest | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      const { data, error } = await supabase
        .from("sell_requests")
        .select(`*, car:cars(*)`)
        .order("created_at", { ascending: false });

      if (!error && data) setRequests(data);
      setLoading(false);
    }
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!selectedReq) return;

    const { error } = await supabase
      .from("sell_requests")
      .update({ status: nextStatus })
      .eq("id", selectedReq.id);

    const { error: err } = await supabase
      .from("cars")
      .update({ is_auction: false })
      .eq("id", selectedReq.car_id);

    if (error || err) {
      alert(`Error updating status: ${error.message}`);
    } else {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedReq.id ? { ...r, status: nextStatus } : r,
        ),
      );
      setSelectedReq((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return !["completed", "rejected"].includes(r.status);
    if (activeTab === "completed") return r.status === "completed";
    return r.status === activeTab;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "submitted":
        return { label: "New Offer", color: "bg-amber-100 text-amber-700" };
      case "reviewed":
        return { label: "Reviewed", color: "bg-blue-100 text-blue-700" };
      case "inspection":
        return {
          label: "In Inspection",
          color: "bg-indigo-100 text-indigo-700",
        };
      case "approved":
        return {
          label: "Purchase Approved",
          color: "bg-emerald-100 text-emerald-700",
        };
      case "payment":
        return {
          label: "Payment Processing",
          color: "bg-purple-100 text-purple-700",
        };
      case "completed":
        return { label: "Unit Acquired", color: "bg-green-600 text-white" };
      case "rejected":
        return { label: "Rejected", color: "bg-red-100 text-red-700" };
      default:
        return {
          label: status.toUpperCase(),
          color: "bg-gray-100 text-gray-500",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
      <AdminSidebar />

      <main className="flex-1 ml-72 flex flex-col min-w-0 min-h-screen">
        <header className="p-8 pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Vehicle Acquisitions
            </h2>
            <p className="text-secondary text-sm font-medium">
              Review and manage vehicles being sold to Unicorn Motors.
            </p>
          </div>
          {/* <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="Search seller or VIN..."
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs w-80 shadow-sm focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div> */}
        </header>

        <section className="p-8 flex gap-8 flex-1 min-h-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex gap-2 mb-6 bg-white/50 p-1.5 rounded-xl w-fit border border-gray-100">
              {["all", "active", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? "bg-white shadow-sm text-black"
                      : "text-secondary hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-premium border border-gray-100 flex-1 overflow-hidden flex flex-col">
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                      <th className="px-6 py-4">Seller Details</th>
                      <th className="px-6 py-4">Vehicle Unit</th>
                      <th className="px-6 py-4">Asking Price</th>
                      <th className="px-6 py-4">Current Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-6 py-8" colSpan={5}>
                              <div className="h-12 bg-gray-50 rounded-xl" />
                            </td>
                          </tr>
                        ))
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Eye className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                          <p className="text-secondary font-bold text-xs uppercase tracking-widest">
                            No acquisition requests found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr
                          key={req.id}
                          className={`group hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            selectedReq?.id === req.id ? "bg-gray-50/80" : ""
                          }`}
                          onClick={() => setSelectedReq(req)}
                        >
                          <td className="px-6 py-6">
                            <div>
                              <p className="text-sm font-black">
                                {req.seller_name}
                              </p>
                              <p className="text-[10px] text-secondary font-bold">
                                {req.seller_phone || "No phone provided"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={req.car.image_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-xs font-black">
                                {req.car.year} {req.car.make} {req.car.model}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-6 font-black text-sm">
                            ${req.asking_price.toLocaleString()}
                          </td>
                          <td className="px-6 py-6">
                            <span
                              className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                getStatusInfo(req.status).color
                              }`}
                            >
                              {getStatusInfo(req.status).label}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <button className="p-2 hover:bg-black hover:text-white rounded-lg transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Inspection Panel */}
          <AnimatePresence mode="wait">
            {selectedReq && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-96 flex flex-col gap-6"
              >
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-premium overflow-y-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight">
                      Request Details
                    </h3>
                    <span className="p-2 bg-gray-50 rounded-lg text-secondary">
                      <FileText className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="space-y-8">
                    <div className="aspect-video rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img
                        src={selectedReq.car.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-2">
                        Seller Notes & Condition
                      </p>
                      <div className="bg-gray-50 rounded-2xl p-5 text-xs text-secondary font-medium leading-relaxed">
                        {selectedReq.condition_notes || "No notes provided."}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1">
                          Asking Price
                        </p>
                        <p className="text-lg font-black">
                          ${selectedReq.asking_price.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1">
                          Negotiable
                        </p>
                        <p className="text-lg font-black">
                          {selectedReq.negotiable ? "YES" : "NO"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      {/* Status-specific actions */}
                      {selectedReq.status === "submitted" && (
                        <button
                          onClick={() => handleUpdateStatus("reviewed")}
                          className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                        >
                          Mark as Reviewed
                        </button>
                      )}

                      {selectedReq.status === "reviewed" && (
                        <button
                          onClick={() => handleUpdateStatus("inspection")}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                          <Truck className="w-4 h-4" /> Schedule Field
                          Inspection
                        </button>
                      )}

                      {selectedReq.status === "inspection" && (
                        <button
                          onClick={() => handleUpdateStatus("approved")}
                          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Purchase Accepted
                        </button>
                      )}

                      {selectedReq.status === "approved" && (
                        <button
                          onClick={() => handleUpdateStatus("payment")}
                          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" /> Process Payment to
                          Seller
                        </button>
                      )}

                      {selectedReq.status === "payment" && (
                        <button
                          onClick={() => handleUpdateStatus("completed")}
                          className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                          <Printer className="w-4 h-4" /> Generate官方 Kwitansi
                          & Clear
                        </button>
                      )}

                      {/* Common Actions */}
                      {!["completed", "rejected"].includes(
                        selectedReq.status,
                      ) && (
                        <button
                          onClick={() => handleUpdateStatus("rejected")}
                          className="w-full py-4 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 rounded-2xl transition-all"
                        >
                          Reject Listing
                        </button>
                      )}

                      {selectedReq.status === "completed" && (
                        <div className="space-y-3">
                          <button className="w-full py-4 bg-white border-2 border-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                            <Printer className="w-4 h-4" /> Re-Print Kwitansi
                          </button>
                          <div className="bg-green-50 text-green-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-center">
                            Transaction Finalized
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seller Quick Info */}
                {/* <div className="bg-black text-white rounded-[2rem] p-8">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
                    Seller Contact
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/20 p-1 overflow-hidden">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedReq.seller_name}`}
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="font-black text-sm">
                        {selectedReq.seller_name}
                      </p>
                      <p className="text-secondary text-[10px]">
                        {selectedReq.seller_phone}
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    Open Direct Messenger
                  </button>
                </div> */}
              </motion.aside>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default AdminAcquisitionsPage;
