"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface Data {
  seller_name: string;
  asking_price: number;
  created_at: Date;
}

export default function PaymentReceipt() {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const [data, setData] = useState<Data>(null);

  useEffect(() => {
    supabase
      .from("sell_requests")
      .select("*")
      .eq("id", id)
      .single()
      .then((v) => setData(v.data));
  }, []);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;

    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

    pdf.save("kwitansi-pembayaran.pdf");
  };

  if (!data)
    return (
      <div className="h-screen items-center justify-center flex">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center gap-6 p-8">
      {/* DOWNLOAD BUTTON */}
      <button
        onClick={downloadPDF}
        className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
      >
        Download PDF
      </button>

      {/* RECEIPT */}
      <div
        ref={receiptRef}
        className="w-[980px] border border-gray-500 bg-[#efefef] text-black font-sans"
      >
        <div className="grid grid-cols-[180px_1fr] min-h-[380px]">
          {/* LEFT SECTION */}
          <div className="border-r border-gray-500 px-5 py-6 text-[15px]">
            <div className="space-y-5">
              <div>
                <div className="font-semibold">No</div>
                <p className="border-b border-black flex-1 h-5">1</p>
              </div>

              <div>
                <div className="font-semibold">Tanggal:</div>
                <p className="border-b border-black flex-1 h-5">
                  {data.created_at.toLocaleString("id-ID").split("T")[0]}
                </p>
              </div>

              <div>
                <div className="font-semibold leading-tight">
                  Terima
                  <br />
                  dari:
                </div>
                <p className="border-b border-black flex-1 h-5">Motora</p>
              </div>

              <div>
                <div className="font-semibold">Jumlah:</div>
                <p className="border-b border-black flex-1 h-5">1</p>
              </div>

              <div>
                <div className="font-semibold leading-tight">
                  Untuk
                  <br />
                  Pembayaran:
                </div>
                <p className="border-b border-black flex-1 h-5">
                  Penjualan Mobil
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="px-5 py-6 relative">
            <h1 className="text-center text-[34px] font-bold tracking-tight mb-10">
              KWITANSI PEMBAYARAN
            </h1>

            <div className="space-y-6 text-[16px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-1/2">
                  <span className="font-semibold whitespace-nowrap">No:</span>
                  <p className="border-b border-black flex-1 h-5">1</p>
                </div>

                <div className="flex items-center gap-2 w-[260px]">
                  <span className="font-semibold">Tanggal:</span>
                  <p className="border-b border-black flex-1 h-5">
                    {data.created_at.toLocaleString("id-ID").split("T")[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold whitespace-nowrap">
                  Terima Dari:
                </span>
                <p className="border-b border-black flex-1 h-5">Motora</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold whitespace-nowrap">
                  Terbilang:
                </span>
                <p className="border-b border-black flex-1 h-5">
                  {data.seller_name}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold whitespace-nowrap">
                    Untuk Pembayaran:
                  </span>
                  <p className="border-b border-black flex-1 h-5">
                    Penjualan Mobil
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              {/* RP BOX */}
              <div className="relative w-[340px] h-[55px] border border-black skew-x-[-14deg] bg-transparent">
                <div className="absolute inset-0 skew-x-[14deg] flex items-center px-7 text-[22px]">
                  Rp. {data.asking_price.toLocaleString("id-ID")}
                </div>
              </div>

              {/* SIGNATURES */}
              <div className="flex gap-20 text-center text-[18px] font-semibold">
                <div>
                  <div>Tanda Tangan Penerima</div>
                </div>

                <div>
                  <div>Tanda Tangan Penyetor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
