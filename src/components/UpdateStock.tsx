import { useState, useTransition } from "react";
import type { Car } from "../types";
import { Check, Loader2, X } from "lucide-react";
import { supabase } from "../supabase";
import { useForm } from "react-hook-form";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  car: Car | null;
};

export default function UpdateInventoryModal({
  isOpen,
  onClose,
  car,
  // onSave,
}: Props) {
  if (!isOpen || !car) return null;

  const [data, setData] = useState(car);
  const {
    handleSubmit,
    formState: { isSubmitting: pending },
    register,
  } = useForm();

  const onSubmit = async (inputData: Car) => {
    const { data: v } = await supabase
      .from("cars")
      .update({
        ...inputData,
        certified_bpkb: data.certified_bpkb,
        certified_stnk: data.certified_stnk,
      })
      .eq("id", car.id)
      .select("*");
    console.log(v);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 font-sans">
      <form
        className="w-full max-w-[500px] rounded-2xl my-8 bg-white p-6 shadow-xl h-screen overflow-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Update Inventaris</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* merek */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            merek
          </label>

          <input
            {...register("make")}
            type="text"
            defaultValue={car.make}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
          />
        </div>

        {/* model */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            model
          </label>

          <input
            {...register("model")}
            type="text"
            defaultValue={car.model}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
          />
        </div>

        {/* year */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            tahun
          </label>

          <input
            {...register("year")}
            type="text"
            defaultValue={car.year}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
          />
        </div>

        {/* harga */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            harga
          </label>

          <input
            {...register("price")}
            type="text"
            defaultValue={car.price}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
          />
        </div>

        {/* milleage */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            jarak tempuh
          </label>

          <input
            {...register("mileage")}
            type="text"
            defaultValue={car.mileage}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
          />
        </div>

        {/* rangka */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            nomor rangka
          </label>

          <input
            {...register("vin")}
            type="text"
            defaultValue={car.vin}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
          />
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            bensin
          </label>

          <select
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
            {...register("fuel_type")}
          >
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Electric</option>
            <option>Hybrid</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            tipe
          </label>

          <select
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
            {...register("body_type")}
          >
            <option>sedan</option>
            <option>suv</option>
            <option>coupe</option>
            <option>convertible</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize">
            deskripsi
          </label>

          <textarea
            {...register("description")}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
            cols={3}
          >
            {car.description}
          </textarea>
        </div>

        {/* Stock */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium">Stock</label>

          <input
            type="number"
            min={0}
            max={99}
            {...register("stock")}
            defaultValue={car.stock}
            className="w-full px-6 py-4 bg-gray-50 outline-none border border-gray-900 border-none rounded-2xl transition-all"
          />
        </div>

        {/* Document Status */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium">
            Document Status
          </label>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() =>
                setData((p) => ({ ...p, certified_stnk: !p.certified_stnk }))
              }
              className={`w-full flex items-center justify-between rounded-lg border p-3 border-gray-500 text-white ${data.certified_stnk ? "bg-green-400" : "bg-red-400"}`}
            >
              <span>STNK Tersedia</span>

              {data.certified_stnk ? <Check /> : <X />}
            </button>

            <button
              type="button"
              onClick={() =>
                setData((p) => ({ ...p, certified_bpkb: !p.certified_bpkb }))
              }
              className={`flex w-full items-center justify-between rounded-lg border p-3 border-gray-500 text-white ${data.certified_bpkb ? "bg-green-400" : "bg-red-400"}`}
            >
              <span>BPKB Tersedia</span>

              {data.certified_bpkb ? <Check /> : <X />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 flex gap-4 items-center"
            style={{ opacity: pending && 0.5 }}
          >
            Save Changes
            {pending && <Loader2 className="animate-spin" />}
          </button>
        </div>
      </form>
    </div>
  );
}
