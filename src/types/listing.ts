import { z } from 'zod';

export const ListingSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    price: z.number().min(0),
    address: z.string(),
    city: z.string(),
    country: z.string(),
    image: z.string(),
    facilities: z.string(),
    userEmail: z.string().email("Invalid email address"),
});

export type Listing = z.infer<typeof ListingSchema>;