import mongoose, { Schema } from "mongoose";


const ListingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  image: { type: String, required: false },
  facilities: { type: String, required: false }, // Or [String] if you parse it as an array
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
}, {
  timestamps: true,
  strict: true, // This ensures extra fields are dropped (default is true anyway)
  versionKey: false
});

export const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);