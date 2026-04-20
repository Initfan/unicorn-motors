export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: "Electric" | "Hybrid" | "Petrol" | "Diesel";
  bodyType: "Sedan" | "SUV" | "Coupe" | "Convertible";
  imageUrl: string;
  isNewArrival?: boolean;
  isCertified?: boolean;
  isEditorsChoice?: boolean;
  description?: string;
}

export type FilterState = {
  bodyType: string[];
  fuelType: string[];
  yearRange: [number, number];
  maxMileage: number | "Any";
};
