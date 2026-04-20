import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import AdminSidebar from "../components/AdminSidebar";
import {
  Truck,
  FileText,
  MapPin,
  CheckCircle2,
  Clock,
  Printer,
  Send,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeliveryBooking {
  id: string;
  full_name: string;
  address: string;
  phone: string;
  status: string;
  handover_method: string;
  created_at: string;
  car: {
    make: string;
    model: string;
    year: number;
    price: number;
    imageUrl: string;
  };
}

function AdminDeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryBooking[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryBooking | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliveries() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(`*, car:cars (make, model, year, price, image_url)`)
        .in("status", [
          "request_delivery",
          "delivering",
          "ready_for_pickup",
          "completed",
        ])
        .order("created_at", { ascending: false });

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          ...item,
          car: {
            make: item.car.make,
            model: item.car.model,
            year: item.car.year,
            price: item.car.price,
            imageUrl: item.car.image_url,
          },
        }));
        setDeliveries(formatted);
      }
      setLoading(false);
    }
    fetchDeliveries();
  }, []);

  const handleDispatch = async (order: DeliveryBooking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "delivering" })
      .eq("id", order.id);
    if (!error) {
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === order.id ? { ...d, status: "delivering" } : d,
        ),
      );
      setSelectedOrder((prev) =>
        prev?.id === order.id ? { ...prev, status: "delivering" } : prev,
      );
    }
  };

  const handleCompleteHandover = async (order: DeliveryBooking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", order.id);
    if (!error) {
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === order.id ? { ...d, status: "completed" } : d,
        ),
      );
      setSelectedOrder((prev) =>
        prev?.id === order.id ? { ...prev, status: "completed" } : prev,
      );
    }
  };

  const preparing = deliveries.filter(
    (d) => d.status === "request_delivery" || d.status === "ready_for_pickup",
  );
  const inTransit = deliveries.filter((d) => d.status === "delivering");
  const delivered = deliveries.filter((d) => d.status === "completed");

  const orderNumber = (id: string) =>
    `DO-${new Date().getFullYear()}-${id.split("-")[0].toUpperCase().slice(0, 6)}`;

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 flex flex-col min-w-0 min-h-screen">
        <header className="p-8 pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Delivery Management
            </h2>
            <p className="text-secondary text-sm font-medium">
              Track premium vehicle shipments, manage digital delivery orders
              (Surat Jalan), and monitor real-time handovers.
            </p>
          </div>
          {/* <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
              Export Report
            </button>
            <button className="px-6 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg">
              Dispatch New
            </button>
          </div> */}
        </header>

        <section className="p-8 flex gap-8 items-start flex-1 min-h-0">
          {/* Kanban Board */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Clock className="w-8 h-8 animate-spin text-gray-300" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {/* Column: Preparing */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-widest">
                      Preparing
                    </h3>
                    <span className="ml-auto text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded-full">
                      {String(preparing.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {preparing.map((order) => (
                      <motion.div
                        key={order.id}
                        layoutId={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all hover:shadow-lg ${selectedOrder?.id === order.id ? "border-black shadow-premium" : "border-gray-100"}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                            TX-{order.id.slice(0, 4).toUpperCase()}
                          </span>
                          <button className="text-gray-300 hover:text-black">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-black text-sm mb-1">
                          {order.car.make} {order.car.model}
                        </h4>
                        <p className="text-[10px] text-secondary font-medium mb-4">
                          {order.handover_method === "delivery"
                            ? "Awaiting dispatch..."
                            : "Ready for showroom pickup"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.full_name}`}
                                alt=""
                              />
                            </div>
                            <span className="text-[10px] font-bold text-secondary">
                              {order.full_name}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-secondary">
                            {order.handover_method === "delivery"
                              ? "🚚 Delivery"
                              : "🏢 Pickup"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {preparing.length === 0 && (
                      <div className="text-center py-12 text-gray-300">
                        <Package className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                          No orders
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column: In Transit */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-widest">
                      In Transit
                    </h3>
                    <span className="ml-auto text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded-full">
                      {String(inTransit.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {inTransit.map((order) => (
                      <motion.div
                        key={order.id}
                        layoutId={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all hover:shadow-lg ${selectedOrder?.id === order.id ? "border-black shadow-premium" : "border-gray-100"}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                            Live Track
                          </span>
                          <Truck className="w-4 h-4 text-blue-500" />
                        </div>
                        <h4 className="font-black text-sm mb-1">
                          {order.car.make} {order.car.model}
                        </h4>
                        <p className="text-[10px] text-secondary font-medium mb-4">
                          Heading to {order.address || "buyer location"}
                        </p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                          <div className="bg-blue-500 h-1.5 rounded-full w-[67%]" />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-secondary">
                          <span>ETA: ~2h</span>
                          <span>67% Complete</span>
                        </div>
                      </motion.div>
                    ))}
                    {inTransit.length === 0 && (
                      <div className="text-center py-12 text-gray-300">
                        <Truck className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                          No active shipments
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column: Delivered */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-widest">
                      Delivered
                    </h3>
                    <span className="ml-auto text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded-full">
                      {String(delivered.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {delivered.map((order) => (
                      <motion.div
                        key={order.id}
                        layoutId={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all hover:shadow-lg ${selectedOrder?.id === order.id ? "border-black shadow-premium" : "border-gray-100"}`}
                      >
                        <div className="mb-3">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                            Completed
                          </span>
                        </div>
                        <h4 className="font-black text-sm mb-1">
                          {order.car.make} {order.car.model}
                        </h4>
                        <p className="text-[10px] text-secondary font-medium">
                          Delivered to {order.full_name}
                        </p>
                      </motion.div>
                    ))}
                    {delivered.length === 0 && (
                      <div className="text-center py-12 text-gray-300">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                          No deliveries yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Handover Live Tracking */}
            {selectedOrder && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black tracking-tight">
                    Handover Live Tracking
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-secondary">
                    <span>
                      TX-ID: {selectedOrder.id.slice(0, 8).toUpperCase()}
                    </span>
                    <button className="text-black hover:underline">
                      View Logistics Logs
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 space-y-0">
                  {/* Timeline Step 1 */}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${selectedOrder.status !== "request_delivery" ? "bg-black" : "bg-gray-300"}`}
                      />
                      <div className="w-[1px] flex-1 bg-gray-200 my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
                        {selectedOrder.status !== "request_delivery"
                          ? "Completed"
                          : "Pending"}{" "}
                        —{" "}
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <h4 className="font-black text-sm mb-1">
                        Carrier Dispatch
                      </h4>
                      <p className="text-xs text-secondary font-medium">
                        Vehicle loaded onto enclosed transporter. Primary driver
                        assigned.
                      </p>
                    </div>
                  </div>

                  {/* Timeline Step 2 */}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${selectedOrder.status === "completed" ? "bg-black" : "bg-gray-300"}`}
                      />
                      <div className="w-[1px] flex-1 bg-gray-200 my-2" />
                    </div>
                    <div className="pb-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
                        {selectedOrder.status === "completed"
                          ? "Completed"
                          : "In Progress"}
                      </p>
                      <h4 className="font-black text-sm mb-1">
                        Checkpoint: Safety Inspection
                      </h4>
                      <p className="text-xs text-secondary font-medium">
                        Routine safety check performed. Vehicle condition
                        verified.
                      </p>
                    </div>
                  </div>

                  {/* Timeline Step 3 */}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${selectedOrder.status === "completed" ? "bg-green-500" : "bg-gray-300 animate-pulse"}`}
                      />
                    </div>
                    <div className="pb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
                        {selectedOrder.status === "completed"
                          ? "Completed"
                          : "Estimated"}
                      </p>
                      <h4 className="font-black text-sm mb-1">
                        Final Handover & Signature
                      </h4>
                      <p className="text-xs text-secondary font-medium">
                        On-site orientation and digital signature collection
                        with the client.
                      </p>
                      {selectedOrder.status !== "completed" && (
                        <div className="mt-4 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Pending Client Signature
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Surat Jalan & Details */}
          <AnimatePresence>
            {selectedOrder && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-[340px] flex-shrink-0 space-y-6 sticky top-8"
              >
                {/* Surat Jalan Card */}
                <div className="bg-black text-white rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Digital Document
                        </p>
                        <h3 className="text-2xl font-black">Surat Jalan</h3>
                      </div>
                      <FileText className="w-8 h-8 text-white/20" />
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Order Number
                        </p>
                        <p className="font-black text-lg tracking-tight">
                          {orderNumber(selectedOrder.id)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Consignee
                        </p>
                        <p className="font-black">{selectedOrder.full_name}</p>
                        <p className="text-xs text-white/60 font-medium">
                          {selectedOrder.address || "Address on file"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Vehicle Details
                        </p>
                        <p className="font-black">
                          {selectedOrder.car.year} {selectedOrder.car.make}{" "}
                          {selectedOrder.car.model}
                        </p>
                        <p className="text-xs text-white/60 font-medium">
                          Chassis: WP0ZZZ99ZLS12***
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <button className="flex-1 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                        <Printer className="w-3 h-3" /> Print PDF
                      </button>
                      <button className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                        <Send className="w-3 h-3" /> Resend Link
                      </button>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                </div>

                {/* Live Fleet Position */}
                <div className="bg-black text-white rounded-[2rem] overflow-hidden relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-repeat" />
                    </div>
                    <MapPin className="w-16 h-16 text-white/10" />
                    {selectedOrder.status === "delivering" && (
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        <span className="w-3 h-3 bg-red-500 rounded-full absolute" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      <p className="text-sm font-bold">Live Fleet Position</p>
                    </div>
                    <p className="text-xs text-white/60 font-medium mt-1">
                      {selectedOrder.status === "delivering"
                        ? "Delivering • Active tracking"
                        : selectedOrder.status === "completed"
                          ? "Delivered successfully"
                          : "Awaiting dispatch"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {selectedOrder.status === "request_delivery" && (
                    <button
                      onClick={() => handleDispatch(selectedOrder)}
                      className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <Truck className="w-4 h-4" /> Dispatch Vehicle & Generate
                      Surat Jalan
                    </button>
                  )}
                  {selectedOrder.status === "delivering" && (
                    <button
                      onClick={() => handleCompleteHandover(selectedOrder)}
                      className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm Handover
                      Complete
                    </button>
                  )}
                  {selectedOrder.status === "ready_for_pickup" && (
                    <button
                      onClick={() => handleCompleteHandover(selectedOrder)}
                      className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm Pickup
                      Complete
                    </button>
                  )}
                  {selectedOrder.status === "completed" && (
                    <div className="w-full py-5 bg-green-50 text-green-700 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-green-100">
                      <CheckCircle2 className="w-4 h-4" /> Handover Completed
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default AdminDeliveryPage;
