import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  Car,
  CheckCircle2,
  Loader2,
  DollarSign,
  ArrowRight,
  Download,
  HelpCircle,
} from "lucide-react";

interface SellRequest {
  id: string;
  status: string;
  asking_price: number;
  created_at: string;
  car: {
    make: string;
    model: string;
    year: number;
    image_url: string;
  };
}

function SellRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyRequests() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("sell_requests")
        .select(`*, car:cars(*)`)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setRequests(data);
      setLoading(false);
    }
    fetchMyRequests();
  }, [user]);

  const getStatusStep = (status: string) => {
    const steps = [
      "submitted",
      "reviewed",
      "inspection",
      "approved",
      "payment",
      "completed",
    ];
    return steps.indexOf(status);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          label: "Under Review",
          desc: "Admin is reviewing your details",
        };
      case "reviewed":
        return { label: "Listing Validated", desc: "Initial check complete" };
      case "inspection":
        return {
          label: "Field Inspection",
          desc: "Our team is visiting your location",
        };
      case "approved":
        return {
          label: "Purchase Approved",
          desc: "Unit accepted by Unicorn Motors",
        };
      case "payment":
        return {
          label: "Processing Payment",
          desc: "Funds are being transferred",
        };
      case "completed":
        return {
          label: "Deal Closed",
          desc: "Transaction finalized & Success",
        };
      case "rejected":
        return {
          label: "Rejected",
          desc: "Unit does not meet our current criteria",
        };
      default:
        return { label: status.toUpperCase(), desc: "Status unknown" };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-[1200px] mx-auto w-full px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            My Car Offers
          </h1>
          <p className="text-secondary font-medium uppercase tracking-widest text-[10px]">
            Track your vehicle acquisition progress in real-time.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-xl font-black mb-2">No Sell Requests Yet</h2>
            <p className="text-secondary text-sm mb-8">
              Think about selling your premium vehicle? Get an offer now.
            </p>
            <a
              href="/sell"
              className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs inline-block hover:scale-[1.02] transition-transform shadow-xl"
            >
              Start Selling My Car
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-premium flex flex-col lg:flex-row gap-10"
              >
                {/* Vehicle Quick Info */}
                <div className="lg:w-72 shrink-0">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 mb-4 group cursor-pointer">
                    <img
                      src={req.car.image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-black leading-tight">
                    {req.car.year} {req.car.make} {req.car.model}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-sm font-black text-black">
                      Rp{req.asking_price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress Tracking */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">
                          Current Stage
                        </p>
                        <h4 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
                          {getStatusDisplay(req.status).label}
                          {req.status === "completed" && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </h4>
                        <p className="text-xs text-secondary mt-1">
                          {getStatusDisplay(req.status).desc}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">
                          Request ID
                        </p>
                        <p className="text-xs font-black">
                          #ACQ-{req.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar Visual */}
                    {req.status !== "rejected" && (
                      <div className="relative pt-8 pb-4 ">
                        <div className="h-1 bg-gray-100 rounded-full w-full absolute top-1/2 -translate-y-1/2 hidden" />
                        <div
                          className="h-1 bg-black rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-1000 "
                          style={{
                            width: `${Math.min(100, (getStatusStep(req.status) / 5) * 100)}%`,
                          }}
                        />
                        <div className="relative flex justify-between mt-2">
                          {[
                            "Offer",
                            "Review",
                            "Field",
                            "Decision",
                            "Payout",
                            "Done",
                          ].map((label, idx) => {
                            const isActive = getStatusStep(req.status) >= idx;
                            return (
                              <div
                                key={label}
                                className="flex flex-col items-center"
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                                    isActive
                                      ? "bg-black border-black scale-110 shadow-lg"
                                      : "bg-white border-gray-200"
                                  }`}
                                />
                                <span
                                  className={`text-[8px] font-black uppercase mt-3 tracking-widest ${
                                    isActive ? "text-black" : "text-gray-300"
                                  }`}
                                >
                                  {label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-gray-50">
                    {/* <button className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                      <HelpCircle className="w-3.5 h-3.5" /> Support Console
                    </button> */}
                    {req.status === "completed" && (
                      <button className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg">
                        <Download className="w-3.5 h-3.5" /> Download Digital
                        Kwitansi
                      </button>
                    )}
                    <button className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-black transition-colors">
                      View Audit Log <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SellRequestsPage;
