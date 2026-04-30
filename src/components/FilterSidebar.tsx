import React from "react";
import { CarFront } from "lucide-react";

export interface Filters {
  bodyType: string | null;
  fuelTypes: string[];
  minYear: number;
  maxMileage: number | null;
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
}) => {
  const toggleFuelType = (type: string) => {
    const newFuelTypes = filters.fuelTypes.includes(type)
      ? filters.fuelTypes.filter((t) => t !== type)
      : [...filters.fuelTypes, type];
    onFilterChange({ ...filters, fuelTypes: newFuelTypes });
  };

  const setBodyType = (type: string) => {
    onFilterChange({
      ...filters,
      bodyType: filters.bodyType === type ? null : type,
    });
  };

  const handleMileage = (val: string) => {
    let mileage: number | null = null;
    if (val === "10k") mileage = 10000;
    if (val === "30k") mileage = 30000;
    if (val === "50k+") mileage = 500000; // angka besar untuk “semua”
    onFilterChange({ ...filters, maxMileage: mileage });
  };

  return (
    <aside className="w-72 bg-white h-[calc(100vh-73px)] sticky top-[73px] p-6 border-r border-gray-100 overflow-y-auto hidden md:block">
      {/* Tipe Bodi */}
      <div className="mb-8">
        <h3 className="filter-section-title">Tipe Bodi</h3>
        <div className="grid grid-cols-2 gap-3">
          {["Sedan", "SUV", "Coupe", "Convertible"].map((type) => (
            <button
              key={type}
              onClick={() => setBodyType(type)}
              className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all gap-2 group ${
                filters.bodyType === type
                  ? "border-black bg-gray-50 ring-1 ring-black"
                  : "hover:border-primary hover:bg-gray-50 border-gray-100"
              }`}
            >
              <CarFront
                className={`w-5 h-5 ${
                  filters.bodyType === type
                    ? "text-black"
                    : "text-secondary group-hover:text-primary"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase ${
                  filters.bodyType === type ? "text-black" : ""
                }`}
              >
                {type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bahan Bakar */}
      <div className="mb-8">
        <h3 className="filter-section-title">Bahan Bakar</h3>
        <div className="space-y-3">
          {["Petrol", "Hybrid", "Electric", "Diesel"].map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.fuelTypes.includes(type)}
                onChange={() => toggleFuelType(type)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
              />
              <span
                className={`text-sm font-medium transition-colors ${
                  filters.fuelTypes.includes(type)
                    ? "text-black"
                    : "text-gray-700 group-hover:text-black"
                }`}
              >
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tahun Produksi Minimal */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="filter-section-title mb-0">Tahun Produksi Minimal</h3>
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold">
            {filters.minYear}
          </span>
        </div>
        <input
          type="range"
          min="2000"
          max={new Date().getFullYear()}
          value={filters.minYear}
          onChange={(e) =>
            onFilterChange({ ...filters, minYear: parseInt(e.target.value) })
          }
          className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Kilometer Maksimal */}
      <div className="mb-8">
        <h3 className="filter-section-title">Kilometer Maksimal</h3>
        <div className="flex flex-wrap gap-2">
          {["Semua", "10k", "30k", "50k+"].map((label) => {
            const isAny = label === "Semua";
            const val =
              label === "10k" ? 10000 : label === "30k" ? 30000 : 500000;
            const isActive = isAny
              ? filters.maxMileage === null
              : filters.maxMileage === val;

            return (
              <button
                key={label}
                onClick={() => handleMileage(label)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-black text-white shadow-lg"
                    : "bg-gray-100 text-secondary hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
