import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import type { Car } from "../types";
import {
  Check,
  Upload,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  FileText,
  Calendar,
  Loader2,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 1 | 2 | 3;

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchCar() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .single();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmitBooking = async () => {
    if (!car || !paymentProof || !user) return;

    setSubmitting(true);
    try {
      // 1. Upload Payment Proof
      const fileExt = paymentProof.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("booking-proofs")
        .upload(filePath, paymentProof);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("booking-proofs").getPublicUrl(filePath);

      // 2. Save Booking to DB
      const { data: bookingData, error: dbError } = await supabase
        .from("bookings")
        .insert({
          car_id: car.id,
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          payment_proof_url: publicUrl,
          booking_fee: 500000,
          status: "pending",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setBookingId(bookingData.id);
      setCurrentStep(3);
    } catch (error) {
      console.error("Submission failed:", error);
      alert(
        "Failed to submit booking. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
        <p className="font-bold text-secondary uppercase tracking-widest text-xs">
          Preparing Checkout...
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
          <h2 className="text-2xl font-black mb-2">Item Expired</h2>
          <p className="text-secondary text-sm mb-8">
            This vehicle selection link has expired or is no longer available in
            our active inventory.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-bold text-sm"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, 3) as Step);
  const prevStep = () =>
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);

  const steps = [
    { title: "Verification", icon: User },
    { title: "Payment", icon: CreditCard },
    { title: "Confirmation", icon: CheckCircle2 },
  ];

  const bookingFee = 500000; // Rp 500.000
  // const subtotal = car.price;
  // const documentationFee = 2500000; // Rp 2.500.000

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 lg:py-16 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Finalize Your Acquisition
            </h1>
            <p className="text-secondary max-w-xl">
              Complete the secure payment process to lock in your inventory
              selection. This transaction is protected by Unicorn Escrow.
            </p>
          </div>

          {/* Countdown Mockup */}
          {/* <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 self-start md:self-auto">
            <div className="text-[10px] font-black uppercase tracking-widest text-red-500 leading-none">
              Booking Window
            </div>
            <div className="flex items-center gap-1 font-mono text-xl font-bold">
              <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                14
              </span>
              <span>:</span>
              <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                59
              </span>
            </div>
          </div> */}
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-start gap-4 mb-16 overflow-x-auto pb-4 p-2 no-scrollbar">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                    currentStep > i + 1
                      ? "bg-green-600 text-white"
                      : currentStep === i + 1
                        ? "bg-black text-white scale-110"
                        : "bg-white text-gray-300 border border-gray-100"
                  }`}
                >
                  {currentStep > i + 1 ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-bold tracking-tight ${currentStep === i + 1 ? "text-black" : "text-gray-400"}`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-12 h-[2px] bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          Verification Details
                        </h3>
                        <p className="text-sm text-secondary">
                          Please provide your legal documents information.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                            placeholder="e.g. John Doe"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                            placeholder="+62 812 3456 7890"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          Residential Address
                        </label>
                        <textarea
                          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all h-32"
                          placeholder="Your complete address for documentation..."
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={
                      !formData.fullName || !formData.phone || !formData.address
                    }
                    className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    Proceed to Payment
                  </button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Payment Proof</h3>
                        <p className="text-sm text-secondary">
                          Upload your bank transfer receipt for verification.
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed ${paymentProof ? "border-green-500 bg-green-50/20" : "border-gray-200 bg-gray-50/50"} rounded-[2rem] p-12 text-center hover:border-black/20 transition-colors group cursor-pointer`}
                    >
                      <div
                        className={`w-16 h-16 ${paymentProof ? "bg-green-100" : "bg-white"} rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                      >
                        {paymentProof ? (
                          <Check className="w-6 h-6 text-green-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <p className="font-bold text-lg mb-1">
                        {paymentProof
                          ? paymentProof.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-secondary mb-8">
                        PNG, JPG or PDF (MAX. 5MB)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="bg-gray-50 p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Check className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                            Bank Virtual Account
                          </p>
                          <p className="font-bold">8832 1009 2234 11</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <ShieldCheck className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                            Beneficiary
                          </p>
                          <p className="font-bold">Unicorn Motors Intl.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={prevStep}
                      disabled={submitting}
                      className="flex-1 py-5 bg-white text-black border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Review Details
                    </button>
                    <button
                      onClick={handleSubmitBooking}
                      disabled={!paymentProof || submitting}
                      className="flex-[2] py-5 bg-black text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Verify Payment"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-12 text-center shadow-premium border border-gray-100 space-y-8"
                >
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black mb-2">
                      Booking Success!
                    </h2>
                    <p className="text-secondary max-w-md mx-auto">
                      Your transaction ID{" "}
                      <strong>
                        #UM-
                        {bookingId?.split("-")[0].toUpperCase() ||
                          car.id.split("-")[0].toUpperCase()}
                      </strong>{" "}
                      is being processed. We will notify you once the internal
                      verification is complete.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-3xl inline-block w-full max-w-md text-left space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary">
                        Expected Verification
                      </span>
                      <span className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Within 15 min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary">Delivery Point</span>
                      <span className="font-bold">Jakarta HQ</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/dashboard/payment/${car.id}`)}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-black text-white rounded-xl font-bold text-sm"
                      >
                        Go to Dashboard <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Car Card Preview */}
              <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-32 h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                  <img
                    src={car.imageUrl}
                    alt={car.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-1">
                    Vehicle Selection
                  </p>
                  <h4 className="font-bold text-lg leading-tight mb-2">
                    {car.year} {car.model}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] font-black px-2 py-0.5 bg-gray-100 rounded-full uppercase">
                      Limited
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-gray-100 rounded-full uppercase">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing Summary */}
              <div className="bg-black text-white rounded-[2rem] overflow-hidden shadow-premium">
                <div className="p-8 pb-4">
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <FileText className="w-5 h-5 text-white/60" />
                    </div>
                    <span className="text-xs font-bold text-white/40">
                      SUMMARY
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-8">
                    Transaction ID:{" "}
                    <span className="opacity-60">
                      #UM-{car.id.split("-")[0].toUpperCase()}
                    </span>
                  </h3>
                </div>

                <div className="p-8 bg-[#1A1A1A] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">
                      Booking Fee
                    </p>
                    <p className="text-[10px] text-white/40 max-w-[120px] leading-tight">
                      Applied to final price upon completion
                    </p>
                  </div>
                  <p className="text-2xl font-black">
                    Rp{bookingFee.toLocaleString()}
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white/60" />
                    </div>
                    <p className="text-[10px] text-white/60 leading-normal">
                      Your booking fee is non-refundable but will be applied
                      toward the final purchase price.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Order Details
                    </p>
                    <div className="space-y-2">
                      <DetailItem
                        icon={Calendar}
                        label="Delivery Date"
                        value="Oct 24, 2024"
                      />
                      <DetailItem
                        icon={MapPin}
                        label="Collection Point"
                        value="Jakarta HQ"
                      />
                      <DetailItem
                        icon={ShieldCheck}
                        label="Warranty"
                        value="Elite Care+"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-secondary text-sm">
          <p>© 2024 Unicorn Motors. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-black">
              Terms of Service
            </a>
            <a href="#" className="hover:text-black">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-white/40" />
        <span className="text-xs text-white/60">{label}:</span>
      </div>
      <span className="text-xs font-bold text-white/90">{value}</span>
    </div>
  );
}

export default BookingPage;
