import { z } from "zod"

export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  price: z.number().min(0, "Price must be positive"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  image: z.string().url("Invalid image URL").optional(),
  facilities: z.string().optional(),
  userEmail: z.string().email("Invalid email"),
})

export type ListingFormData = z.infer<typeof listingSchema> 