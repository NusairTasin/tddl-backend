import mongoose, { Schema } from "mongoose";

const BlogSchema = new Schema({
    title: { type: String, required: true},
    description: { type: String, required: true },
    author: { type: String, required: true},
    contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true }
},
{ 
    timestamps: true,
    strict: true,
    versionKey: false
}
);

export const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);