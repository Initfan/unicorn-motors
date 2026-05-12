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

export interface Booking {
  id: string;
  car_id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  booking_fee: number;
  status: string;
  payment_proof_url?: string;
  ktp_url?: string;
  dp_proof_url?: string;
  full_payment_url?: string;
  handover_method?: string;
  cars?: Car;
  created_at: Date;
}

export type FilterState = {
  bodyType: string[];
  fuelType: string[];
  yearRange: [number, number];
  maxMileage: number | "Any";
};
