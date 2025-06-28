import { z } from "zod"

export const ListingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  price: z.number().min(0, "Price must be positive"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  facilities: z.string().optional().or(z.literal("")),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid contact email"),
  contactPhone: z.string().min(1, "Contact phone is required"),
})

export type ListingFormData = z.infer<typeof ListingSchema> 