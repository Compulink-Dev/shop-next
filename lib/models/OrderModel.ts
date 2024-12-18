import mongoose from 'mongoose'


const validStatuses = [
  'Order Received',
  'Shipped',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Collected',
];


const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        color: { type: String }, // Add color
        size: { type: String },   // Add size

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
    tracking: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        status: { type: String, enum: validStatuses, required: true },
        message: { type: String }, // Optional
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
)

orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.tracking.push({
      product: null, // Or a placeholder
      status: 'Order Received',
      message: 'Your order has been received.',
    });
  }
  next();
});

const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default OrderModel

export type Order = {
  _id: string
  user?: { name: string }
  items: [OrderItem]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  paymentResult?: { id: string; status: string; email_address: string }
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  isPaid: boolean
  isDelivered: boolean
  paidAt?: string
  deliveredAt?: string
  createdAt: string
  estimatedDeliveryAt: string
}

export type OrderItem = {
  name: string
  slug: string
  qty: number
  image: string
  price: number
  color: string
  size: string
}

export type ShippingAddress = {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
}


export type TrackingEntry = {
  status: TrackingStatus,
  timestamp: string; // ISO string
  message?: string; // Optional
};

export enum TrackingStatus {
  OrderReceived = 'Order Received',
  Shipped = 'Shipped',
  InTransit = 'In Transit',
  OutForDelivery = 'Out for Delivery',
  Delivered = 'Delivered',
  Collected = 'Collected',
}
