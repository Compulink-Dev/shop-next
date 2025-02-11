import mongoose from "mongoose";

const validStatuses = [
  "Order Received",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Collected",
];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        color: { type: String },
        size: { type: String },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: { id: String, status: String, email_address: String },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    estimatedDeliveryAt: { type: Date },
    paymentPollUrl: { type: String }, // Ensure this field is present
    tracking: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false, // Make product field optional
        },
        status: { type: String, enum: validStatuses, required: true },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.tracking.push({
      product: null,
      status: "Order Received",
      message: "Your order has been received.",
    });
  }
  next();
});

// Update `isPaid` to true when payment is successful
orderSchema.methods.markAsPaid = function (paymentResult: any) {
  if (paymentResult.status === "success") {
    this.isPaid = true;
    this.paidAt = new Date();
    this.paymentResult = paymentResult; // Store payment result info
    return this.save();
  }
  return Promise.reject(new Error("Payment was not successful"));
};

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;

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
