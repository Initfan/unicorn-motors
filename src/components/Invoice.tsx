import React, { useEffect, useState, useTransition } from "react";
import { supabase } from "../supabase";
import { useParams } from "react-router-dom";
import type { Booking, Car } from "../types";

type Invoice = Pick<
  Booking,
  "car_id" | "full_name" | "phone" | "address" | "cars"
>;

const Invoice: React.FC = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<Invoice>(null);
  const [pending, transition] = useTransition();

  useEffect(() => {
    transition(
      async () =>
        await supabase
          .from("bookings")
          .select("car_id, full_name, phone, address, cars(*)")
          .eq("id", id)
          .single()
          .then((v) => setBooking({ ...v.data, cars: v.data.cars[0] as Car })),
    );
  }, []);

  if (pending) return;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center font-sans">
      {/* Main Container - A4 Ratio styling */}
      <div className="w-[800px] bg-white shadow-2xl p-16 flex flex-col">
        {/* Header */}
        <h1 className="text-6xl font-light tracking-tight text-gray-800 uppercase mb-16">
          motora
        </h1>

        {/* Client & Metadata Info */}
        <div className="flex justify-between mb-12">
          <div>
            <h2 className="font-bold text-sm mb-1">Tagihan ke:</h2>
            <div className="text-[13px] leading-relaxed text-gray-700">
              <p className="font-semibold text-gray-900">{booking.full_name}</p>
              <p>{booking.phone},</p>
              <p>Location, {booking.address},</p>
              <p>570xx59x</p>
            </div>
          </div>
          <div className="text-right flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <span className="font-bold">Invoice #</span>
              <span className="text-gray-600 text-right">52148</span>
              <span className="font-bold">Date</span>
              <span className="text-gray-600 text-right">01 / 02 / 2020</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-grow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-[10px] uppercase tracking-widest text-gray-700">
                <th className="py-3 px-4 text-left font-bold w-16">Qty</th>
                <th className="py-3 px-4 text-left font-bold">Description</th>
                <th className="py-3 px-4 text-right font-bold w-24">Price</th>
                <th className="py-3 px-4 text-right font-bold w-24">Total</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {/* {booking.map((item, index) => ( */}
              <tr
              // key={index}
              // className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-4 px-4 text-gray-800">1</td>
                <td className="py-4 px-4 text-gray-800">
                  {booking?.cars?.make} - {booking.cars.model}
                </td>
                <td className="py-4 px-4 text-right text-gray-800">
                  {Number(booking?.cars?.price.toFixed(2)).toLocaleString(
                    "id-ID",
                  )}
                </td>
                <td className="py-4 px-4 text-right text-gray-800">
                  {Number(booking?.cars?.price * 1).toLocaleString("id-ID")}
                </td>
              </tr>
              {/* ))} */}
              {/* Empty rows to maintain structure if needed */}
              <tr className="border-b border-gray-100">
                <td colSpan={4} className="py-4"></td>
              </tr>
              <tr className="border-b border-gray-100">
                <td colSpan={4} className="py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex justify-between">
          <div className="w-1/2">
            <p className="text-[11px] font-bold text-gray-800 mb-1">
              Bank Transfer
            </p>
            <p className="text-[10px] text-gray-500 italic">
              8832 1009 2234 11
            </p>
          </div>

          <div className="w-1/3">
            <div className="flex justify-between text-xs mb-2 px-4">
              <span className="font-semibold">Subtotal</span>
              <span>{booking.cars.price.toLocaleString("id-ID")}</span>
            </div>
            <div className="bg-gray-200 flex justify-between items-center py-3 px-4">
              <span className="font-bold text-sm tracking-widest uppercase">
                Total
              </span>
              <span className="font-bold text-lg">
                {booking.cars.price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
