import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import {
  Camera,
  Info,
  DollarSign,
  Upload,
  MessageSquare,
  Loader2,
  X,
} from "lucide-react";

const SELL_STEPS = [
  { id: "media", label: "Media & Foto", icon: Camera },
  { id: "details", label: "Detail Kendaraan", icon: Info },
  { id: "pricing", label: "Harga & Ketentuan", icon: DollarSign },
];

function SellPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeStep, setActiveStep] = useState("media");
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    vin: "",
    year: "2024",
    make: "",
    model: "",
    trim: "",
    mileage: "",
    fuelType: "Petrol",
    bodyType: "Sedan",
    narrative: "",
    price: "",
    negotiable: "Negotiable",
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos([...photos, ...newFiles]);

      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPhotoUrls([...photoUrls, ...newUrls]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);

    const newUrls = [...photoUrls];
    newUrls.splice(index, 1);
    setPhotoUrls(newUrls);
  };

  const uploadPhotos = async () => {
    if (photos.length === 0) return null;

    // For this demo/task, we'll just upload the first photo as the main image_url
    const file = photos[0];
    const fileExt = file.name.split(".").pop();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("car-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("car-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Silahkan login terlebih dahulu untuk mengirimkan listing.");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      const mainImageUrl = await uploadPhotos();

      if (!mainImageUrl) {
        alert("Silahkan unggah minimal 1 foto.");
        setSubmitting(false);
        return;
      }

      // 1. Insert car data
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .insert([
          {
            vin: formData.vin,
            make: formData.make || formData.model.split(" ")[0] || "Unknown",
            model: formData.model,
            year: parseInt(formData.year),
            price: parseFloat(formData.price),
            mileage: parseInt(formData.mileage.replace(/,/g, "")),
            fuel_type: formData.fuelType,
            body_type: formData.bodyType || "Sedan",
            image_url: mainImageUrl,
            description: formData.narrative,
          },
        ])
        .select()
        .single();

      if (carError) throw carError;

      // 2. Create sell request for admin review
      const { error: sellError } = await supabase.from("sell_requests").insert([
        {
          car_id: carData.id,
          seller_id: user.id,
          seller_name: user.user_metadata?.full_name || user.email,
          seller_phone: user.user_metadata?.phone || "",
          asking_price: parseFloat(formData.price),
          condition_notes: formData.narrative,
          negotiable: formData.negotiable === "Negotiable",
          status: "submitted",
        },
      ]);

      if (sellError) throw sellError;

      alert(
        "Kendaraan Anda telah berhasil dikirim untuk ditinjau! Lacak kemajuan di dasbor Anda.",
      );
      navigate("/sell/requests");
    } catch (error: any) {
      console.error(error);
      alert("Error submitting listing: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveStep(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-8">
            <div>
              <h1 className="text-2xl font-black mb-8">Kirimkan Daftar Anda</h1>
              <nav className="space-y-2">
                {SELL_STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => scrollToSection(step.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      activeStep === step.id
                        ? "bg-white text-black shadow-sm ring-1 ring-gray-100"
                        : "text-secondary hover:bg-gray-100"
                    }`}
                  >
                    <step.icon
                      className={`w-4 h-4 ${activeStep === step.id ? "text-black" : "text-gray-400"}`}
                    />
                    {step.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Form Content */}
        <main className="flex-1 space-y-8 max-w-4xl pb-32">
          {/* Section: Media */}
          <section
            id="media"
            className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100 scroll-mt-28"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-2">Media & Foto</h2>
              <p className="text-secondary text-sm">
                Foto berkualitas tinggi meningkatkan kecepatan penjualan sebesar
                40%. Unggah maximal 1 foto.
              </p>
            </div>

            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-100 rounded-[2rem] p-12 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  max={1}
                  onChange={handlePhotoSelect}
                />
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-bold text-lg mb-1">
                  Jatuhkan foto kendaraan di sini
                </p>
                <p className="text-xs text-secondary">
                  atau klik untuk menjelajah dari komputer Anda
                </p>
                <p className="text-[10px] text-gray-300 mt-4 uppercase tracking-[0.2em]">
                  Menerima JPG, PNG, dan HEIC resolusi tinggi hingga 5MB.
                </p>
              </div>

              {photoUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photoUrls.map((url, i) => (
                    <div
                      key={i}
                      className={`relative rounded-2xl overflow-hidden aspect-square border border-gray-100 ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                    >
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        alt={`Upload ${i}`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(i);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white rounded-md">
                          Foto Utama
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section: Details */}
          <section
            id="details"
            className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100 scroll-mt-28"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black mb-2">Detail Kendaraan</h2>
                <p className="text-secondary text-sm">
                  Berikan spesifikasi teknis yang akurat.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-1">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                  Nomor Rangka{" "}
                  <MessageSquare className="w-3 h-3 cursor-help text-blue-500" />
                </label>
                <input
                  type="text"
                  placeholder="B123ABC..."
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                  value={formData.vin}
                  onChange={(e) =>
                    setFormData({ ...formData, vin: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Tahun
                  </label>
                  <input
                    type="text"
                    placeholder="2024"
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Merek & Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Porsche 911"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Bahan Bakar
                </label>
                <select
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all appearance-none"
                  value={formData.fuelType}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelType: e.target.value })
                  }
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Jarak Tempuh
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1,200"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: e.target.value })
                    }
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">
                    Jarak Tempuh
                  </span>
                </div>
              </div>
              <div className="space-y-2 col-span-full">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Cerita Kendaraan
                </label>
                <textarea
                  placeholder="Tell the story of your car. Mention modifications, service records, and standout features..."
                  className="w-full px-6 py-6 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-black transition-all h-32 resize-none"
                  value={formData.narrative}
                  onChange={(e) =>
                    setFormData({ ...formData, narrative: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          {/* Section: Pricing & Terms */}
          <section
            id="pricing"
            className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100 scroll-mt-28"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-2">Harga & Ketentuan</h2>
              <p className="text-secondary text-sm">
                Tetapkan harga jual dan ketentuan listing.
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Harga Jual
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-bold text-xl"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Negosiasi
                  </label>
                  <div className="flex gap-4">
                    {["Tetap", "Nego"].map((type) => (
                      <label
                        key={type}
                        className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl cursor-pointer transition-all border ${formData.negotiable === type ? "bg-black text-white border-black" : "bg-gray-50 text-secondary border-transparent hover:bg-gray-100"}`}
                      >
                        <input
                          type="radio"
                          name="negotiability"
                          className="sr-only"
                          checked={formData.negotiable === type}
                          onChange={() =>
                            setFormData({ ...formData, negotiable: type })
                          }
                        />
                        <span className="text-sm font-bold">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-gray-200 text-black focus:ring-black"
                    required
                  />
                  <p className="text-sm text-secondary leading-relaxed">
                    Saya menyetujui{" "}
                    <span className="text-black font-bold underline cursor-pointer">
                      Ketentuan Layanan
                    </span>{" "}
                    dan mengonfirmasi bahwa semua informasi yang diberikan
                    tentang kendaraan akurat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Submission Footer */}
          <div className="">
            {/* <div className="fixed bottom-6 left-4/5 -translate-x-1/2 z-50 w-full max-w-4xl px-6"> */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-premium border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${submitting ? "bg-blue-500 animate-pulse" : "bg-red-500"}`}
                />
                <span className="text-xs font-bold text-secondary">
                  {submitting
                    ? "Mengunggah & Menyimpan..."
                    : "Perubahan belum disimpan"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || photos.length === 0}
                  className="px-8 py-3 bg-black text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Terbitkan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SellPage;
