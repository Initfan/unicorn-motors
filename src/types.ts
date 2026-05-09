export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: "Electric" | "Hybrid" | "Petrol" | "Diesel";
  body_type: "Sedan" | "SUV" | "Coupe" | "Convertible";
  image_url: string;
  vin: string;
  is_new_arrival?: boolean;
  is_certified?: boolean;
  is_editro_choice?: boolean;
  description?: string;
  stock: number;
  certified_stnk: boolean;
  certified_bpkb: boolean;
}

export type FilterState = {
  bodyType: string[];
  fuelType: string[];
  yearRange: [number, number];
  maxMileage: number | "Any";
};
