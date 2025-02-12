// /lib/types.ts
export type AuthUser = {
  _id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export type Context = {
  params: { id: string }; // Modify according to your route parameters
  user?: AuthUser; // Optional user property to hold authenticated user info
};

// Updated Product type
export type Product = {
  _id: string; // Ensure _id is always treated as a string
  part: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string; // Optional banner field
  price: number;
  brand: string;
  description: string;
  category: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  colors?: string[]; // Optional colors array
  sizes?: string[]; // Optional sizes array
};

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string; // Assuming ObjectId will be stored as a string
  name: string;
  slug: string;
  qty: number;
  image: string;
  price: number;
  color?: string;
  size?: string;
}
