import z from "zod";

export const sellReqSchema = z.object({
  vin: z.string(),
  seller_name: z.string(),
  seller_phone: z.string(),
  negotiable: z.string(),
  payment_method: z.string(),
});

export type sellReqSchemaType = z.infer<typeof sellReqSchema>;

export const carSchema = z.object({
  vin: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  description: z.string().min(1),
  year: z.string().min(1),
  price: z.string().min(1),
  mileage: z.string().min(1),
  fuel_type: z.string().min(1),
  body_type: z.string().min(1),
});

export type carSchemaType = z.infer<typeof sellReqSchema>;

export const sellSchema = sellReqSchema.merge(carSchema);

export type sellSchemaType = z.infer<typeof sellSchema>;
