import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import AdminSidebar from "../components/AdminSidebar";
import {
  CreditCard,
  Plus,
  TrendingUp,
  Gavel,
  Clock,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  car_id: string;
  full_name: string;
  status: string;
  booking_fee: number;
  created_at: string;
  car: {
    make: string;
    model: string;
    year: number;
    price: number;
    imageUrl: string;
  };
  payment_proof_url?: string;
  ktp_url?: string;
  dp_proof_url?: string;
}

function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          car:cars (
            make,
            model,
            year,
            image_url,
            price
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
      } else if (data) {
        const formattedData = data.map((item: any) => ({
          ...item,
          car: {
            make: item.car.make,
            model: item.car.model,
            year: item.car.year,
            imageUrl: item.car.image_url,
            price: item.car.price,
          },
        }));
        setTransactions(formattedData);
      }
      setLoading(false);
    }

    fetchTransactions();
  }, []);

  const handleApprove = async () => {
    if (!selectedTxn) return;

    let nextStatus = "verified";
    if (selectedTxn.status === "dp_paid") nextStatus = "verified_dp";
    if (selectedTxn.status === "verified_dp") nextStatus = "processing_docs";

    const { error } = await supabase
      .from("bookings")
      .update({ status: nextStatus })
      .eq("id", selectedTxn.id);

    if (error) {
      alert("Failed to update status");
    } else {
      setTransactions((txns) =>
        txns.map((t) =>
          t.id === selectedTxn.id ? { ...t, status: nextStatus } : t,
        ),
      );
      setSelectedTxn((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return ["pending", "dp_paid"].includes(t.status);
    if (filter === "completed")
      return ["verified", "verified_dp", "completed"].includes(t.status);
    return true;
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Booking Paid", color: "bg-amber-100 text-amber-700" };
      case "verified":
        return {
          label: "Booking Verified",
          color: "bg-blue-100 text-blue-700",
        };
      case "dp_paid":
        return {
          label: "DP & KTP Ready",
          color: "bg-purple-100 text-purple-700",
        };
      case "verified_dp":
        return {
          label: "DP & ID Verified",
          color: "bg-green-100 text-green-700",
        };
      case "processing_docs":
        return {
          label: "Birokrasi Aktif",
          color: "bg-blue-600 text-white shadow-lg shadow-blue-100",
        };
      case "full_paid":
        return {
          label: "Awaiting Delivery",
          color: "bg-emerald-600 text-white",
        };
      case "completed":
        return {
          label: "Fully Cleared",
          color: "bg-emerald-100 text-emerald-800",
        };
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

      {/* Main Content Area */}
      <main className="flex-1 ml-72 flex flex-col min-w-0 min-h-screen">
        <header className="p-8 pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Transactions
            </h2>
            <p className="text-secondary text-sm font-medium">
              Manage automotive sales and auction clearances.
            </p>
          </div>
          {/* <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-12 pr-6 py-3 bg-white border-none rounded-2xl w-80 text-sm shadow-sm focus:ring-2 focus:ring-black transition-all"
            />
          </div> */}
        </header>

        <section className="p-8 flex gap-8 items-start flex-1 min-h-0">
          {/* Table Container */}
          <div className="flex-1 min-w-0">
            {/* Stats Grid */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${selectedTxn ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-6 mb-12 transition-all duration-500`}
            >
              <StatCard
                icon={CreditCard}
                label="Total Sales"
                value="$4,820,000"
                trend="+12.5%"
                trendUp
              />
              <StatCard icon={Gavel} label="Active Auctions" value="142" />
              {!selectedTxn && (
                <>
                  <StatCard
                    icon={Clock}
                    label="Pending Validations"
                    value="28"
                    Urgent
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Performance"
                    value="98.2%"
                  />
                </>
              )}
            </div>

            {/* Content Table Area */}
            <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 overflow-hidden transition-all duration-500">
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <h3 className="font-black tracking-tight">
                  Recent Transactions
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <TabButton
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </TabButton>
                  <TabButton
                    active={filter === "pending"}
                    onClick={() => setFilter("pending")}
                  >
                    Processing
                  </TabButton>
                  <TabButton
                    active={filter === "completed"}
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </TabButton>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-secondary/40 border-b border-gray-50">
                      <th className="px-8 py-6">Vehicle</th>
                      <th className="px-8 py-6">Transaction ID</th>
                      <th className="px-8 py-6 text-right">Amount</th>
                      <th className="px-8 py-6 text-center">Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center">
                          <Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-200" />
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((txn) => {
                        const status = getStatusDisplay(txn.status);
                        return (
                          <tr
                            key={txn.id}
                            className={`hover:bg-gray-50/50 transition-colors group ${selectedTxn?.id === txn.id ? "bg-gray-50/50" : ""}`}
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-10 rounded-lg bg-gray-100 overflow-hidden shadow-sm flex-shrink-0">
                                  <img
                                    src={txn.car.imageUrl}
                                    alt={txn.car.model}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-black leading-tight">
                                    {txn.car.make} {txn.car.model}
                                  </p>
                                  <p className="text-[10px] text-secondary font-medium">
                                    {txn.car.year} •{" "}
                                    {txn.full_name.split(" ")[0]}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-xs font-mono font-medium text-secondary">
                              TXN-{txn.id.split("-")[0].toUpperCase()}
                            </td>
                            <td className="px-8 py-6 text-right font-black text-sm">
                              Rp{txn.car.price.toLocaleString()}
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status.color}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() => setSelectedTxn(txn)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTxn?.id === txn.id ? "bg-black text-white shadow-lg" : "bg-gray-100 text-gray-400 hover:bg-black hover:text-white"}`}
                              >
                                {[
                                  "verified",
                                  "verified_dp",
                                  "completed",
                                ].includes(txn.status)
                                  ? "View"
                                  : "Validate"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar (Validation) */}
          <AnimatePresence>
            {selectedTxn && (
              <motion.aside
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-[480px] bg-white rounded-[2.5rem] border border-gray-100 flex flex-col shadow-xl sticky top-8 overflow-hidden"
              >
                <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="flex items-center gap-2 text-lg font-black tracking-tight">
                      <CheckCircle2 className="w-5 h-5" />{" "}
                      {["verified", "verified_dp", "completed"].includes(
                        selectedTxn.status,
                      )
                        ? "Verification Complete"
                        : "Required Validation"}
                    </h3>
                    <button
                      onClick={() => setSelectedTxn(null)}
                      className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
                    >
                      <Plus className="w-5 h-5 rotate-45 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <p className="text-xs text-secondary leading-relaxed font-medium mb-10">
                    {selectedTxn.status === "dp_paid"
                      ? "High-Priority: Down Payment and Identity Verification required to initiate vehicle transport."
                      : selectedTxn.status === "pending"
                        ? "Booking Fee Verification: Initial commitment clearance for vehicle reservation."
                        : "Transaction successfully cleared and moved to fulfillment."}
                  </p>

                  {/* Dynamic Preview Section */}
                  {selectedTxn.status === "pending" && (
                    <div className="mb-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-4">
                        Booking Fee Receipt
                      </p>
                      <div className="aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden border border-gray-100 shadow-inner group relative cursor-pointer">
                        {selectedTxn.payment_proof_url ? (
                          <img
                            src={selectedTxn.payment_proof_url}
                            alt="Receipt"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Clock className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="px-6 py-2 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5" /> View Full Size
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTxn.status === "dp_paid" && (
                    <div className="space-y-8 mb-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Identity
                          Verification (KTP)
                        </p>
                        <div className="aspect-video bg-gray-100 rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner group relative cursor-pointer">
                          {selectedTxn.ktp_url ? (
                            <img
                              src={selectedTxn.ktp_url}
                              alt="KTP"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Clock className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-4 flex items-center gap-2">
                          <CreditCard className="w-3 h-3" /> Down Payment
                          Receipt
                        </p>
                        <div className="aspect-video bg-gray-100 rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner group relative cursor-pointer">
                          {selectedTxn.dp_proof_url ? (
                            <img
                              src={selectedTxn.dp_proof_url}
                              alt="DP Proof"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Clock className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {["pending", "dp_paid", "verified_dp"].includes(
                      selectedTxn.status,
                    ) ? (
                      <button
                        onClick={handleApprove}
                        className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        {selectedTxn.status === "verified_dp"
                          ? "Process STNK & BPKB"
                          : selectedTxn.status === "dp_paid"
                            ? "Approve identity & DP"
                            : "Approve Booking Fee"}
                      </button>
                    ) : (
                      <div className="w-full py-5 bg-green-50 text-green-700 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-green-100">
                        <CheckCircle2 className="w-4 h-4" /> Stage Active
                      </div>
                    )}
                    <button className="w-full py-4 text-secondary font-black uppercase tracking-widest text-[10px] hover:text-black">
                      Request Documentation
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, Urgent }: any) {
  return (
    <div
      className={`bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all ${Urgent && "ring-2 ring-red-50"}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trendUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
            >
              {trend}
            </span>
          )}
          {Urgent && (
            <span className="text-[10px] font-black px-2 py-0.5 bg-red-100 text-red-600 rounded-full animate-pulse">
              Urgent
            </span>
          )}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/50 mb-1">
          {label}
        </p>
        <div className="text-3xl font-black tracking-tight">{value}</div>
      </div>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
    </div>
  );
}

function TabButton({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-white shadow-sm text-black" : "text-secondary hover:text-black"}`}
    >
      {children}
    </button>
  );
}

export default AdminTransactionsPage;
