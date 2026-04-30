import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Gauge, Zap } from "lucide-react";
import type { Car } from "../types";

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-premium transition-all">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {car.isNewArrival && (
          <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            Baru Tiba
          </span>
        )}
        {car.isCertified && (
          <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            Bersertifikat
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold tracking-tight">
          {car.make} {car.model}
        </h3>

        <div className="flex items-center gap-4 text-secondary text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            <span>{car.mileage.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{car.fuelType}</span>
          </div>
        </div>

        <p className="text-xl font-bold">Rp{car.price.toLocaleString()}</p>

        <Link
          to={`/car/${car.id}`}
          className="block w-full py-3 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors text-center"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
