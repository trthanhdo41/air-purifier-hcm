import { Category } from "@/types";
import { 
  Wind, 
  Zap, 
  Shield, 
  Droplets,
  Activity,
  Home,
  Heart,
  Sparkles,
  Filter,
  AirVent,
  Leaf,
  Sun
} from "lucide-react";

export const categories: Category[] = [
  // Máy lọc không khí theo công nghệ
  { id: "may-loc-hepa", name: "Máy lọc HEPA", slug: "may-loc-hepa", icon: Wind },
  { id: "may-loc-ion", name: "Máy lọc Ion", slug: "may-loc-ion", icon: Zap },
  { id: "may-loc-carbon", name: "Máy lọc Carbon", slug: "may-loc-carbon", icon: Shield },
  { id: "may-loc-uv", name: "Máy lọc UV", slug: "may-loc-uv", icon: Sun },
  
  // Máy lọc theo diện tích
  { id: "may-loc-phong-nho", name: "Phòng nhỏ (< 20m²)", slug: "may-loc-phong-nho", icon: Home },
  { id: "may-loc-phong-vua", name: "Phòng vừa (20-40m²)", slug: "may-loc-phong-vua", icon: Home },
  { id: "may-loc-phong-lon", name: "Phòng lớn (> 40m²)", slug: "may-loc-phong-lon", icon: Home },
  
  // Máy lọc đặc biệt
  { id: "may-loc-khong-khi-thong-minh", name: "Máy lọc thông minh", slug: "may-loc-khong-khi-thong-minh", icon: Activity },
  { id: "may-loc-khong-khi-tiet-kiem", name: "Tiết kiệm điện", slug: "may-loc-khong-khi-tiet-kiem", icon: Leaf },
  { id: "may-loc-khong-khi-cao-cap", name: "Cao cấp", slug: "may-loc-khong-khi-cao-cap", icon: Sparkles },
  
  // Phụ kiện và bộ lọc
  { id: "bo-loc-thay-the", name: "Bộ lọc thay thế", slug: "bo-loc-thay-the", icon: Filter },
  { id: "phu-kien-may-loc", name: "Phụ kiện", slug: "phu-kien-may-loc", icon: AirVent },
];

export const brands = [
  "Xiaomi", "Sharp", "Philips", "Samsung", "LG", "Panasonic",
  "Levoit", "Dyson", "Coway", "Blueair", "Honeywell", "Winix",
  "Boneco", "Venta", "Austin Air", "IQAir", "Alen", "Rabbit Air"
];

