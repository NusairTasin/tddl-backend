import { z } from "zod"

export const contactCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required")
})

export const contactUpdateSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(1, "Phone is required").optional()
}) 