
export enum UserRole {
  USER = 'user',
  DELIVERY = 'delivery',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  REFUNDED = 'Refunded',
}

export interface User {
  id: number;
  role: UserRole;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  categoryId: number;
  hostId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  isActive: boolean;
  ingredients?: string[];
  specs?: { key: string; value: string }[];
  reviews?: { id: number; userName: string; rating: number; comment: string }[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: 'Cash on Delivery';
  status: OrderStatus;
  deliveryPersonId?: number;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
}

export interface CartItem extends Product {
  quantity: number;
}
