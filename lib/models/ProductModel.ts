// lib/models/ProductModel.ts

import mongoose from 'mongoose';

// Define the schema for MongoDB
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    banner: { type: String, default: undefined }, // Ensure that 'banner' is optional in the schema
    tracking: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        message: { type: String, required: false },  // Optional message field
      }
    ]
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);

export default ProductModel;

// Updated Product type
export type Product = {
  _id: string;  // Ensure _id is always treated as a string
  name: string;
  slug: string;
  image: string;
  banner?: string; // Optional banner field
  price: number;
  brand: string;
  description: string;
  category: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  colors?: string[]; // Optional colors array
  sizes?: string[];  // Optional sizes array
};
