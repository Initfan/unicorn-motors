import React from "react";
import { Link } from "react-router-dom";
import type { Car } from "../types";

interface FeaturedCardProps {
  car: Car;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ car }) => {
  return (
    <div className="md:col-span-2 relative grid md:grid-cols-2 rounded-3xl overflow-hidden bg-black text-white min-h-[400px]">
      <div className="absolute top-0 left-0 w-full h-full md:relative md:h-auto overflow-hidden">
        <img
          src={car.imageUrl}
          alt={car.model}
          className="w-full h-full object-cover opacity-60 md:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:hidden" />
      </div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center bg-[#2D2D2D]">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4 block">
          Editor's Choice
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          <Link
            to={`/car/${car.id}`}
            className="hover:text-gray-300 transition-colors"
          >
            {car.year} {car.make} <br /> {car.model}
          </Link>
        </h2>

        <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-md">
          {car.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="text-3xl font-bold mr-2">
            ${car.price.toLocaleString()}
          </span>
          <Link
            to={`/booking/${car.id}`}
            className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-200 transition-all"
          >
            Book Now
          </Link>
          <Link
            to={`/car/${car.id}`}
            className="px-6 py-2 border border-white/20 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-all"
          >
            View Details
          </Link>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-black">
              <img
                src="/cars/porsche.png"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-8 h-8 rounded-lg bg-black text-[8px] flex items-center justify-center border-2 border-black font-bold">
              +
            </div>
          </div>
          <span className="text-xs font-medium text-white/80">
            1 car selected for comparison
          </span>
          <button className="ml-auto px-4 py-2 bg-white text-black rounded-full text-xs font-bold">
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
