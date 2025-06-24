import { z } from "zod"

export const blogCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required")
})

export const blogUpdateSchema = z.object({
  id: z.string().min(1, "Blog ID is required"),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional()
}) 