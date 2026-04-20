import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import FilterSidebar, { type Filters } from "../components/FilterSidebar";
import CarCard from "../components/CarCard";
import FeaturedCard from "../components/FeaturedCard";
import { supabase } from "../supabase";
import { ChevronLeft, ChevronRight, Loader2, XCircle } from "lucide-react";
import type { Car } from "../types";

function Marketplace() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    bodyType: null,
    fuelTypes: [],
    minYear: 2000,
    maxMileage: null,
  });

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      let query = supabase
        .from("cars")
        .select("*")
        .eq("is_auction", false)
        .order("created_at", { ascending: false });

      if (filters.bodyType) {
        query = query.eq("body_type", filters.bodyType);
      }

      if (filters.fuelTypes.length > 0) {
        query = query.in("fuel_type", filters.fuelTypes);
      }

      if (filters.minYear > 2000) {
        query = query.gte("year", filters.minYear);
      }

      if (filters.maxMileage !== null) {
        query = query.lte("mileage", filters.maxMileage);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching cars:", error);
      } else if (data) {
        const formattedCars: Car[] = data.map((item: any) => ({
          id: item.id,
          make: item.make,
          model: item.model,
          year: item.year,
          price: item.price,
          mileage: item.mileage,
          fuelType: item.fuel_type,
          bodyType: item.body_type,
          imageUrl: item.image_url,
          isNewArrival: item.is_new_arrival,
          isCertified: item.is_certified,
          isEditorsChoice: item.is_editors_choice,
          description: item.description,
        }));
        setCars(formattedCars);
      }
      setLoading(false);
    }

    fetchCars();
  }, [filters]);

  const featuredCar = useMemo(
    () => cars.find((car) => car.isEditorsChoice) || cars[0],
    [cars],
  );

  const regularCars = useMemo(
    () => cars.filter((car) => car.id !== featuredCar?.id),
    [cars, featuredCar],
  );

  const resetFilters = () => {
    setFilters({
      bodyType: null,
      fuelTypes: [],
      minYear: 2000,
      maxMileage: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] mx-auto w-full">
        <FilterSidebar filters={filters} onFilterChange={setFilters} />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Main Title & Sort */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">
                Available Inventory
              </h2>
              <p className="text-secondary text-sm font-medium">
                Showing {cars.length} luxury & performance vehicles
              </p>
            </div>

            <div className="flex items-center gap-4">
              {(filters.bodyType ||
                filters.fuelTypes.length > 0 ||
                filters.minYear > 2000 ||
                filters.maxMileage !== null) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  <XCircle className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">
                  Sort:
                </span>
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all">
                  Recently Added
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-secondary gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-black" />
              <p className="font-bold">Syncing with global inventory...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {cars.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <p className="text-xl font-bold text-gray-400 mb-2">
                    No vehicles found
                  </p>
                  <p className="text-sm text-gray-400">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              ) : (
                <>
                  {/* First Row of Cars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularCars.slice(0, 3).map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>

                  {/* Featured Section */}
                  {featuredCar && <FeaturedCard car={featuredCar} />}

                  {/* Second Row of Cars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularCars.slice(3).map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-2 pt-8 pb-12">
                    <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[1].map((num, i) => (
                      <button
                        key={i}
                        className={`w-12 h-12 rounded-full text-sm font-bold transition-all bg-black text-white`}
                      >
                        {num}
                      </button>
                    ))}
                    <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Marketplace;
