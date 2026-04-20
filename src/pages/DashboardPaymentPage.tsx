import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import type { Car } from "../types";
import {
  Check,
  Clock,
  ShieldCheck,
  Loader2,
  Info,
  CreditCard,
  Download,
  Truck,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

interface Booking {
  id: string;
  car_id: string;
  full_name: string;
  status: string;
  booking_fee: number;
  created_at: string;
}

function DashboardPaymentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // New state for DP & KTP
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [fullReceiptFile, setFullReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDPPayment = async () => {
    if (!ktpFile || !receiptFile || !booking) return;
    setIsUploading(true);

    try {
      // 1. Upload KTP
      const ktpExt = ktpFile.name.split(".").pop();
      const ktpPath = `${booking.id}/ktp_${Math.random()}.${ktpExt}`;
      const { error: ktpError } = await supabase.storage
        .from("booking-proofs")
        .upload(ktpPath, ktpFile);

      if (ktpError) throw ktpError;

      // 2. Upload DP Receipt
      const receiptExt = receiptFile.name.split(".").pop();
      const receiptPath = `${booking.id}/dp_receipt_${Math.random()}.${receiptExt}`;
      const { error: receiptError } = await supabase.storage
        .from("booking-proofs")
        .upload(receiptPath, receiptFile);

      if (receiptError) throw receiptError;

      // 3. Get Public URLs
      const ktpUrl = supabase.storage
        .from("booking-proofs")
        .getPublicUrl(ktpPath).data.publicUrl;
      const receiptUrl = supabase.storage
        .from("booking-proofs")
        .getPublicUrl(receiptPath).data.publicUrl;

      // 4. Update Booking Status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "dp_paid",
          ktp_url: ktpUrl,
          dp_proof_url: receiptUrl,
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      alert("DP Payment & KTP Uploaded Successfully! Awaiting verification.");
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFullPayment = async () => {
    if (!fullReceiptFile || !booking) return;
    setIsUploading(true);

    try {
      const ext = fullReceiptFile.name.split(".").pop();
      const path = `${booking.id}/full_receipt_${Math.random()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("booking-proofs")
        .upload(path, fullReceiptFile);

      if (uploadError) throw uploadError;

      const fullReceiptUrl = supabase.storage
        .from("booking-proofs")
        .getPublicUrl(path).data.publicUrl;

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "full_paid",
          full_payment_url: fullReceiptUrl,
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      alert("Full Payment Receipt Uploaded! Preparing for vehicle delivery.");
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectHandover = async (method: "pickup" | "delivery") => {
    if (!booking) return;
    setLoading(true);

    const nextStatus =
      method === "pickup" ? "ready_for_pickup" : "request_delivery";

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: nextStatus,
          handover_method: method,
        })
        .eq("id", booking.id);

      if (error) throw error;
      alert(
        `Handover method selected: ${method === "pickup" ? "Self Collection" : "Home Delivery"}`,
      );
    } catch (err: any) {
      console.error(err);
      alert("Error selecting handover method: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let channel: any;

    async function fetchData() {
      if (!id || !user) return;
      setLoading(true);

      // 1. Fetch Booking Details (ID from URL is the Booking ID)
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (bookingData) {
        setBooking({
          id: bookingData.id,
          car_id: bookingData.car_id,
          full_name: bookingData.full_name,
          status: bookingData.status,
          booking_fee: bookingData.booking_fee,
          created_at: bookingData.created_at,
        });

        // 2. Fetch associated car using booking's car_id
        const { data: carData } = await supabase
          .from("cars")
          .select("*")
          .eq("id", bookingData.car_id)
          .maybeSingle();

        if (carData) {
          setCar({
            id: carData.id,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            price: carData.price,
            mileage: carData.mileage,
            fuelType: carData.fuel_type,
            bodyType: carData.body_type,
            imageUrl: carData.image_url,
            isNewArrival: carData.is_new_arrival,
            isCertified: carData.is_certified,
            isEditorsChoice: carData.is_editors_choice,
            description: carData.description,
          });
        }

        // 3. Setup Real-time subscription
        channel = supabase
          .channel(`booking-updates-${bookingData.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "bookings",
              filter: `id=eq.${bookingData.id}`,
            },
            (payload: any) => {
              setBooking((prev) =>
                prev ? { ...prev, status: payload.new.status } : null,
              );
            },
          )
          .subscribe();
      }

      setLoading(false);
    }

    fetchData();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
        <p className="font-bold text-secondary uppercase tracking-widest text-xs">
          Authenticating Session...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-black mb-2">No Active Booking</h2>
          <p className="text-secondary text-sm mb-8">
            You haven't initiated an acquisition for this vehicle yet. Please
            visit the vehicle detail page to start the process.
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-black text-white rounded-full font-bold text-sm"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <h2 className="text-2xl font-black mb-4">Car Information Missing</h2>
          <Link to="/" className="text-blue-600 font-bold hover:underline">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = `UM-${booking.id.split("-")[0].toUpperCase()}`;
  const basePrice = car.price;
  const total = basePrice + basePrice * 0.3 + 50e4;

  const bookingFee = booking.booking_fee;
  const downPayment = car.price * 0.3;
  const fullPayment = car.price;

  // Status mapping
  const isBookingVerified = booking.status !== "pending";
  const isDPPaid = [
    "dp_paid",
    "verified_dp",
    "processing_docs",
    "full_paid",
    "completed",
  ].includes(booking.status);
  const isFullPaymentEnabled = [
    "processing_docs",
    "full_paid",
    "request_delivery",
    "delivering",
    "ready_for_pickup",
    "completed",
  ].includes(booking.status);
  const isFullPaid = [
    "full_paid",
    "request_delivery",
    "delivering",
    "ready_for_pickup",
    "completed",
  ].includes(booking.status);

  let progress = "15%";
  if (booking.status === "verified") progress = "25%";
  if (booking.status === "dp_paid") progress = "35%";
  if (booking.status === "verified_dp") progress = "50%";
  if (booking.status === "processing_docs") progress = "60%";
  if (booking.status === "full_paid") progress = "75%";
  if (booking.status === "request_delivery") progress = "80%";
  if (booking.status === "delivering") progress = "90%";
  if (booking.status === "ready_for_pickup") progress = "90%";
  if (booking.status === "completed") progress = "100%";

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Flow (Left/Center) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Header Section */}
            <div className="bg-[#F8F9FA] rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2">
                  Order #{orderNumber}
                </p>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-5xl font-black tracking-tight mb-2">
                      {car.make} {car.model}
                    </h1>
                    <p className="text-secondary font-medium uppercase tracking-widest text-xs">
                      Premium Acquisition Flow
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">
                      Total Amount Due
                    </p>
                    <h2 className="text-4xl font-black tracking-tighter">
                      Rp{total.toLocaleString("id-ID", {})}
                    </h2>
                  </div>
                </div>

                <div className="mt-12">
                  {/* Current Status Badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        booking.status === "completed"
                          ? "bg-green-600 text-white"
                          : booking.status === "delivering"
                            ? "bg-blue-600 text-white animate-pulse"
                            : booking.status === "request_delivery"
                              ? "bg-amber-100 text-amber-700"
                              : booking.status === "ready_for_pickup"
                                ? "bg-indigo-100 text-indigo-700"
                                : booking.status === "full_paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : booking.status === "processing_docs"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {booking.status === "pending" && "Booking Submitted"}
                      {booking.status === "verified" && "Booking Verified"}
                      {booking.status === "dp_paid" && "DP Under Review"}
                      {booking.status === "verified_dp" && "DP Verified"}
                      {booking.status === "processing_docs" &&
                        "STNK & BPKB Processing"}
                      {booking.status === "full_paid" && "Payment Complete"}
                      {booking.status === "request_delivery" &&
                        "Awaiting Dispatch"}
                      {booking.status === "delivering" &&
                        "🚚 Vehicle In Transit"}
                      {booking.status === "ready_for_pickup" &&
                        "Ready at Showroom"}
                      {booking.status === "completed" &&
                        "✓ Transaction Complete"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-[0.1em]">
                      Acquisition Progress
                    </p>
                    <p className="text-xs font-black">{progress} Complete</p>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: progress }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${booking.status === "completed" ? "bg-green-600" : booking.status === "delivering" ? "bg-blue-600" : "bg-black"}`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>
                      {booking.status === "pending"
                        ? "Awaiting Verification"
                        : booking.status === "completed"
                          ? "All Steps Complete"
                          : "In Progress"}
                    </span>
                    <span>
                      {booking.status === "completed"
                        ? "Delivered"
                        : booking.status === "delivering"
                          ? "Delivery Active"
                          : booking.status === "ready_for_pickup"
                            ? "Pickup Ready"
                            : "Delivery Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Timeline */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black tracking-tight mb-6">
                Transaction Timeline
              </h3>

              {/* Step 1: Paid */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative group">
                <div className="flex items-center gap-6">
                  <div
                    className={`w-12 h-12 ${isBookingVerified ? "bg-black" : "bg-gray-100"} text-white rounded-full flex items-center justify-center shadow-lg transition-colors`}
                  >
                    {isBookingVerified ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-gray-500">
                        Step 01
                      </span>
                      <h4 className="font-bold text-lg">Booking Fee</h4>
                    </div>
                    <p className="text-xs text-secondary font-medium">
                      {isBookingVerified
                        ? `Reservation secured on ${new Date(booking.created_at).toLocaleDateString()}`
                        : "Awaiting internal bank verification"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold mb-1">
                    Rp
                    {bookingFee.toLocaleString("id-ID", {})}
                  </p>
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-1 ${isBookingVerified ? "text-green-600" : "text-amber-500"}`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${isBookingVerified ? "bg-green-600" : "bg-amber-500"}`}
                    />{" "}
                    {isBookingVerified ? "Paid" : "In Review"}
                  </p>
                </div>
              </div>

              {/* Vertical Line Connector */}
              <div className="ml-14 w-[1px] h-8 bg-gray-200" />

              {/* Step 2: Active */}
              <div
                className={`bg-white rounded-3xl p-8 border-2 ${isBookingVerified ? "border-black shadow-premium" : "border-gray-100 opacity-60"} flex flex-col gap-8 relative transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-12 h-12 ${isDPPaid ? "bg-black text-white" : "bg-gray-100 text-black"} rounded-full flex items-center justify-center transition-colors shadow-lg`}
                    >
                      {isDPPaid ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 bg-black rounded-full mx-0.5 animate-pulse" />
                          <div className="w-1.5 h-1.5 bg-black rounded-full mx-0.5 animate-pulse delay-75" />
                          <div className="w-1.5 h-1.5 bg-black rounded-full mx-0.5 animate-pulse delay-150" />
                        </>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isBookingVerified ? (isDPPaid ? "bg-green-600 text-white" : "bg-black text-white") : "bg-gray-100 text-gray-400"}`}
                        >
                          {isDPPaid
                            ? "Processed"
                            : isBookingVerified
                              ? "Active"
                              : "Locked"}
                        </span>
                        <h4
                          className={`font-bold text-lg ${!isBookingVerified && "text-gray-400"}`}
                        >
                          Down Payment (30%) & Identity Verification
                        </h4>
                      </div>
                      <p className="text-xs text-secondary font-medium">
                        {isDPPaid
                          ? "Your identity and DP clearance are being reviewed by the concierge."
                          : "Secure your acquisition with 30% DP and upload your ID Card (KTP)"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold mb-1 ${!isBookingVerified && "text-gray-400"}`}
                    >
                      Rp
                      {downPayment.toLocaleString("id-ID", {})}
                    </p>
                    {!isDPPaid && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> In Review
                      </p>
                    )}
                  </div>
                </div>

                {/* KTP Upload Section */}
                {isBookingVerified && !isDPPaid && (
                  <>
                    <div className="pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary">
                          1. Identity Verification (KTP)
                        </h5>
                        <div className="relative group">
                          <input
                            type="file"
                            id="ktp-upload"
                            className="opacity-0 absolute inset-0 cursor-pointer z-10"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setKtpFile(file);
                            }}
                          />
                          <div
                            className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors ${ktpFile ? "border-green-500 bg-green-50/10" : "border-gray-200 group-hover:border-black"}`}
                          >
                            {ktpFile ? (
                              <>
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-green-700">
                                  {ktpFile.name}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                  <ShieldCheck className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-secondary">
                                  Drop KTP Image Here
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary">
                          2. Transfer Receipt (DP)
                        </h5>
                        <div className="relative group">
                          <input
                            type="file"
                            id="receipt-upload"
                            className="opacity-0 absolute inset-0 cursor-pointer z-10"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setReceiptFile(file);
                            }}
                          />
                          <div
                            className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors ${receiptFile ? "border-green-500 bg-green-50/10" : "border-gray-200 group-hover:border-black"}`}
                          >
                            {receiptFile ? (
                              <>
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-green-700">
                                  {receiptFile.name}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                  <CreditCard className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-secondary">
                                  Attach Transfer Receipt
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={handleDPPayment}
                        disabled={!ktpFile || !receiptFile || isUploading}
                        className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Processing
                          </>
                        ) : (
                          <>Pay Now & Verify Identity</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Step 2.5: Administration (Conditional) */}
              {[
                "verified_dp",
                "processing_docs",
                "full_paid",
                "request_delivery",
                "delivering",
                "ready_for_pickup",
                "completed",
              ].includes(booking.status) && (
                <>
                  <div className="ml-14 w-[1px] h-8 bg-black" />
                  <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
                          Parallel Process
                        </div>
                        <h4 className="text-xl font-black tracking-tight">
                          Vehicle Administration
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* STNK Progress */}
                        <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                                Document 01
                              </p>
                              <h5 className="font-bold">STNK & Plat Nomor</h5>
                            </div>
                            <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                              <span>Processing</span>
                              <span className="text-blue-400">~2 Weeks</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "45%" }}
                                className="h-full bg-blue-400"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                            Pendaftaran kendaraan sedang diproses di SAMSAT
                            terkait.
                          </p>
                        </div>

                        {/* BPKB Progress */}
                        <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                                Document 02
                              </p>
                              <h5 className="font-bold">BPKB (Original)</h5>
                            </div>
                            <Clock className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                              <span>Queueing</span>
                              <span className="text-amber-400">~2 Months</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "15%" }}
                                className="h-full bg-amber-400"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                            Penerbitan buku kepemilikan oleh Korlantas Polri.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Decorative pattern */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                  </div>
                </>
              )}

              {/* Vertical Line Connector */}
              <div className="ml-14 w-[1px] h-8 bg-gray-200" />

              {/* Step 3: Full Payment */}
              <div
                className={`bg-white rounded-3xl p-8 border-2 transition-all ${
                  isFullPaymentEnabled
                    ? "border-black shadow-premium"
                    : "border-gray-100 opacity-60"
                } flex flex-col gap-8 relative`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-12 h-12 ${isFullPaid ? "bg-black text-white" : "bg-gray-100 text-black"} rounded-full flex items-center justify-center shadow-lg transition-colors`}
                    >
                      {isFullPaid ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <CreditCard className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            isFullPaid
                              ? "bg-green-600 text-white"
                              : isFullPaymentEnabled
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          Step 03
                        </span>
                        <h4
                          className={`font-bold text-lg ${!isFullPaymentEnabled && "text-gray-400"}`}
                        >
                          Full Payment
                        </h4>
                      </div>
                      <p className="text-xs text-secondary font-medium">
                        {isFullPaid
                          ? "Payment verified. Preparing for final vehicle handover."
                          : isFullPaymentEnabled
                            ? "Administration started. You can now settle the remaining balance."
                            : "Locked until vehicle administration begins."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold mb-1 ${!isFullPaymentEnabled && "text-gray-400"}`}
                    >
                      Rp
                      {fullPayment.toLocaleString("id-ID", {})}
                    </p>
                    {isFullPaid ? (
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center justify-end gap-1">
                        <Check className="w-3 h-3" /> Paid
                      </p>
                    ) : (
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                        Scheduled
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Payment Upload Section */}
                {isFullPaymentEnabled && !isFullPaid && (
                  <div className="pt-8 border-t border-gray-50 space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary">
                      Upload Proof of Full Payment
                    </h5>
                    <div className="relative group">
                      <input
                        type="file"
                        className="opacity-0 absolute inset-0 cursor-pointer z-10"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFullReceiptFile(file);
                        }}
                      />
                      <div
                        className={`p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${
                          fullReceiptFile
                            ? "border-green-500 bg-green-50/10"
                            : "border-gray-200 group-hover:border-black"
                        }`}
                      >
                        {fullReceiptFile ? (
                          <>
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                              <Check className="w-6 h-6" />
                            </div>
                            <p className="font-bold text-sm">
                              {fullReceiptFile.name}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                              <Download className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-secondary">
                              Drag & Drop Receipt or Click to Browse
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleFullPayment}
                      disabled={!fullReceiptFile || isUploading}
                      className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-30"
                    >
                      {isUploading ? "Uploading..." : "Confirm Full Payment"}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 4: Handover Protocol (Conditional) */}
              {(isFullPaid ||
                [
                  "ready_for_pickup",
                  "request_delivery",
                  "delivering",
                  "completed",
                ].includes(booking.status)) && (
                <>
                  <div className="ml-14 w-[1px] h-8 bg-gray-200" />
                  <div className="bg-white rounded-[2.5rem] p-10 border-2 border-black shadow-premium relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-black text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                            Final Stage
                          </div>
                          <h4 className="text-xl font-black tracking-tight">
                            Handover Protocol
                          </h4>
                        </div>
                        {booking.status === "completed" && (
                          <div className="flex items-center gap-2 text-green-600 font-black uppercase text-[10px] tracking-widest">
                            <Check className="w-4 h-4" /> Delivered & Handed
                            Over
                          </div>
                        )}
                      </div>

                      {booking.status === "full_paid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <button
                            onClick={() => handleSelectHandover("pickup")}
                            className="p-8 border-2 border-gray-100 rounded-[2rem] hover:border-black transition-all text-left flex flex-col gap-4 group/btn"
                          >
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover/btn:bg-black group-hover/btn:text-white transition-colors">
                              <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-black text-lg">
                                Ambil Langsung
                              </p>
                              <p className="text-xs text-secondary font-medium">
                                Datang ke showroom untuk serah terima fisik
                                secara exclusive.
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => handleSelectHandover("delivery")}
                            className="p-8 border-2 border-gray-100 rounded-[2rem] hover:border-black transition-all text-left flex flex-col gap-4 group/btn"
                          >
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover/btn:bg-black group-hover/btn:text-white transition-colors">
                              <Truck className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-black text-lg">
                                Kirim ke Rumah
                              </p>
                              <p className="text-xs text-secondary font-medium">
                                Pengiriman menggunakan towing premium ke lokasi
                                Anda.
                              </p>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
                              {booking.status.includes("delivery") ||
                              booking.status === "delivering" ? (
                                <Truck className="w-8 h-8" />
                              ) : (
                                <MapPin className="w-8 h-8" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-lg">
                                {booking.status.includes("delivery") ||
                                booking.status === "delivering"
                                  ? "Delivery Service"
                                  : "Showroom Collection"}
                              </h5>
                              <p className="text-xs text-secondary font-medium">
                                {booking.status === "request_delivery" &&
                                  "Awaiting dispatch officer assignment..."}
                                {booking.status === "delivering" &&
                                  "Vehicle is in transit with our premium carrier."}
                                {booking.status === "ready_for_pickup" &&
                                  "Vehicle is detailed and ready for you in our showroom."}
                                {booking.status === "completed" &&
                                  "Vehicle successfully handed over. Enjoy the ride!"}
                              </p>
                            </div>
                          </div>

                          {(booking.status === "delivering" ||
                            booking.status === "request_delivery") && (
                            <div className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                              Active Dispatch
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Area (Right) */}
          <div className="space-y-6">
            {/* Car Mini Detail */}
            <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={car.imageUrl}
                  alt={car.model}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold">Order Details</h4>
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-6 pb-6 border-b border-gray-50">
                  Verified Transaction • Concierge Handled
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      model
                    </span>
                    <span className="text-xs font-bold font-mono tracking-tighter">
                      {car.model}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      mileage
                    </span>
                    <span className="text-xs font-bold">{car.mileage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      year
                    </span>
                    <span className="text-xs font-bold">{car.year}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Summary */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-8">
                Billing Summary
              </h4>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary font-medium">
                    Base Price
                  </span>
                  <span className="text-xs font-bold">
                    Rp
                    {basePrice.toLocaleString("id-ID", {})}
                  </span>
                </div>
              </div>
              <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest">
                  Total
                </span>
                <span className="text-2xl font-black">
                  Rp
                  {basePrice.toLocaleString("id-ID", {})}
                </span>
              </div>
            </div>

            {/* Concierge Support */}
            {/* <div className="bg-black text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gray-800 p-0.5 border border-white/10 overflow-hidden">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Julian"
                      alt="Julian"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Concierge Assistance</p>
                    <p className="text-[10px] text-green-400 flex items-center gap-1 font-bold">
                      <span className="w-1 h-1 bg-green-400 rounded-full" />{" "}
                      Julian is online now
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/60 mb-8 leading-relaxed font-medium">
                  Have questions about your payment schedule or financing
                  options? Julian is here to help you finalize your dream
                  acquisition.
                </p>
                <button className="w-full py-4 bg-white/10 border border-white/20 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all">
                  Message Julian
                </button>
              </div>
              Decorative Pattern
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div> */}
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 mt-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <h3 className="text-xs font-black uppercase tracking-widest">
            Unicorn Motors{" "}
            <span className="font-medium text-secondary ml-2 normal-case">
              © 2024 Administrative Console
            </span>
          </h3>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-secondary">
            <a href="#" className="hover:text-black">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-black">
              Terms of Service
            </a>
            <a href="#" className="hover:text-black">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPaymentPage;
