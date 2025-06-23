import mongoose, { Schema } from "mongoose";

const ContactSchema = new Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    phone: { type: String, required: true}
},
{
    timestamps: true,
    versionKey: false
}
)

export const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);