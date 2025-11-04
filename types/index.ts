import { LucideIcon } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  rating?: number;
  reviews?: number;
  badge?: 'hot' | 'new' | 'sale';
  stock: number;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  full_name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  images?: string[];
  created_at: string;
  user?: {
    email?: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'inactive' | 'expired';
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'hot-deals';

export interface FilterState {
  category: string;
  brand: string;
  priceRange: [number, number];
  sortBy: SortOption;
}

export interface User {
  id: string;
  email?: string;
  role?: 'admin' | 'user';
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
}

