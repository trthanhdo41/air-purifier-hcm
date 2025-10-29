import { Product } from "@/types";

// Unified product image for all air purifiers
const PRODUCT_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqcWbIqxD1gmh2l8psxDUx8A6osESPMx-J8Q&s";

export const products: Product[] = [
  // Máy lọc HEPA
  {
    id: "1",
    name: "Máy lọc không khí Xiaomi Mi Air Purifier 4 Pro",
    price: 4990000,
    originalPrice: 6490000,
    discount: 23,
    image: PRODUCT_IMAGE,
    category: "may-loc-hepa",
    brand: "Xiaomi",
    rating: 4.8,
    reviews: 445,
    badge: "hot",
    stock: 18
  },
  {
    id: "2",
    name: "Máy lọc không khí Sharp FP-J80EV-H",
    price: 8990000,
    originalPrice: 10990000,
    discount: 18,
    image: PRODUCT_IMAGE,
    category: "may-loc-hepa",
    brand: "Sharp",
    rating: 4.7,
    reviews: 289,
    stock: 12
  },
  {
    id: "3",
    name: "Máy lọc không khí Levoit Core 400S",
    price: 5490000,
    originalPrice: 6990000,
    discount: 21,
    image: PRODUCT_IMAGE,
    category: "may-loc-hepa",
    brand: "Levoit",
    rating: 4.6,
    reviews: 178,
    badge: "new",
    stock: 22
  },

  // Máy lọc Ion
  {
    id: "4",
    name: "Máy lọc không khí Panasonic F-PXH55A",
    price: 3290000,
    originalPrice: 4290000,
    discount: 23,
    image: PRODUCT_IMAGE,
    category: "may-loc-ion",
    brand: "Panasonic",
    rating: 4.5,
    reviews: 234,
    badge: "sale",
    stock: 35
  },
  {
    id: "5",
    name: "Máy lọc không khí Samsung AX60R5080WD",
    price: 7990000,
    originalPrice: 9990000,
    discount: 20,
    image: PRODUCT_IMAGE,
    category: "may-loc-ion",
    brand: "Samsung",
    rating: 4.7,
    reviews: 156,
    stock: 8
  },

  // Máy lọc Carbon
  {
    id: "6",
    name: "Máy lọc không khí Philips AC2889/10",
    price: 6990000,
    originalPrice: 8990000,
    discount: 22,
    image: PRODUCT_IMAGE,
    category: "may-loc-carbon",
    brand: "Philips",
    rating: 4.8,
    reviews: 312,
    badge: "hot",
    stock: 15
  },
  {
    id: "7",
    name: "Máy lọc không khí LG PuriCare AS60GDWV0",
    price: 11990000,
    originalPrice: 14990000,
    discount: 20,
    image: PRODUCT_IMAGE,
    category: "may-loc-carbon",
    brand: "LG",
    rating: 4.6,
    reviews: 189,
    stock: 10
  },

  // Máy lọc UV
  {
    id: "8",
    name: "Máy lọc không khí Coway Airmega 300S",
    price: 8990000,
    originalPrice: 11990000,
    discount: 25,
    image: PRODUCT_IMAGE,
    category: "may-loc-uv",
    brand: "Coway",
    rating: 4.9,
    reviews: 267,
    badge: "hot",
    stock: 12
  },
  {
    id: "9",
    name: "Máy lọc không khí Blueair Blue Pure 211+",
    price: 12990000,
    originalPrice: 15990000,
    discount: 19,
    image: PRODUCT_IMAGE,
    category: "may-loc-uv",
    brand: "Blueair",
    rating: 4.7,
    reviews: 198,
    stock: 6
  },

  // Phòng nhỏ
  {
    id: "10",
    name: "Máy lọc không khí Xiaomi Mi Air Purifier 3C",
    price: 2490000,
    originalPrice: 3290000,
    discount: 24,
    image: PRODUCT_IMAGE,
    category: "may-loc-phong-nho",
    brand: "Xiaomi",
    rating: 4.4,
    reviews: 456,
    badge: "sale",
    stock: 45
  },
  {
    id: "11",
    name: "Máy lọc không khí Sharp FP-F40E-W",
    price: 3990000,
    originalPrice: 4990000,
    discount: 20,
    image: PRODUCT_IMAGE,
    category: "may-loc-phong-nho",
    brand: "Sharp",
    rating: 4.5,
    reviews: 234,
    stock: 28
  },

  // Phòng vừa
  {
    id: "12",
    name: "Máy lọc không khí Dyson Pure Cool TP04",
    price: 15990000,
    originalPrice: 19990000,
    discount: 20,
    image: PRODUCT_IMAGE,
    category: "may-loc-phong-vua",
    brand: "Dyson",
    rating: 4.8,
    reviews: 189,
    badge: "hot",
    stock: 8
  },
  {
    id: "13",
    name: "Máy lọc không khí Honeywell HPA300",
    price: 7990000,
    originalPrice: 9990000,
    discount: 20,
    image: PRODUCT_IMAGE,
    category: "may-loc-phong-vua",
    brand: "Honeywell",
    rating: 4.6,
    reviews: 156,
    stock: 15
  },

  // Phòng lớn
  {
    id: "14",
    name: "Máy lọc không khí IQAir HealthPro Plus",
    price: 25990000,
    originalPrice: 29990000,
    discount: 13,
    image: PRODUCT_IMAGE,
    category: "may-loc-phong-lon",
    brand: "IQAir",
    rating: 4.9,
    reviews: 89,
    badge: "hot",
    stock: 3
  },
  {
    id: "15",
    name: "Máy lọc không khí Austin Air HealthMate Plus",
    price: 18990000,
    originalPrice: 22990000,
    discount: 17,
    image: PRODUCT_IMAGE,
    category: "may-loc-phong-lon",
    brand: "Austin Air",
    rating: 4.7,
    reviews: 67,
    stock: 5
  },

  // Máy lọc thông minh
  {
    id: "16",
    name: "Máy lọc không khí Xiaomi Mi Air Purifier 4 Lite",
    price: 3490000,
    originalPrice: 4490000,
    discount: 22,
    image: PRODUCT_IMAGE,
    category: "may-loc-khong-khi-thong-minh",
    brand: "Xiaomi",
    rating: 4.5,
    reviews: 334,
    badge: "new",
    stock: 25
  },
  {
    id: "17",
    name: "Máy lọc không khí Samsung AX90R5080WD",
    price: 12990000,
    originalPrice: 15990000,
    discount: 19,
    image: PRODUCT_IMAGE,
    category: "may-loc-khong-khi-thong-minh",
    brand: "Samsung",
    rating: 4.8,
    reviews: 123,
    stock: 7
  },

  // Tiết kiệm điện
  {
    id: "18",
    name: "Máy lọc không khí Winix Zero S",
    price: 5990000,
    originalPrice: 7990000,
    discount: 25,
    image: PRODUCT_IMAGE,
    category: "may-loc-khong-khi-tiet-kiem",
    brand: "Winix",
    rating: 4.6,
    reviews: 178,
    badge: "sale",
    stock: 20
  },
  {
    id: "19",
    name: "Máy lọc không khí Boneco P500",
    price: 4990000,
    originalPrice: 6490000,
    discount: 23,
    image: PRODUCT_IMAGE,
    category: "may-loc-khong-khi-tiet-kiem",
    brand: "Boneco",
    rating: 4.4,
    reviews: 145,
    stock: 18
  },

  // Cao cấp
  {
    id: "20",
    name: "Máy lọc không khí Dyson Pure Hot+Cool HP09",
    price: 19990000,
    originalPrice: 24990000,
    discount: 20,
    image: PRODUCT_IMAGE,
    category: "may-loc-khong-khi-cao-cap",
    brand: "Dyson",
    rating: 4.9,
    reviews: 234,
    badge: "hot",
    stock: 4
  },
  {
    id: "21",
    name: "Máy lọc không khí Rabbit Air MinusA2",
    price: 17990000,
    originalPrice: 21990000,
    discount: 18,
    image: PRODUCT_IMAGE,
    category: "may-loc-khong-khi-cao-cap",
    brand: "Rabbit Air",
    rating: 4.8,
    reviews: 89,
    stock: 6
  },

  // Bộ lọc thay thế
  {
    id: "22",
    name: "Bộ lọc HEPA Xiaomi Mi Air Purifier 4",
    price: 890000,
    originalPrice: 1290000,
    discount: 31,
    image: PRODUCT_IMAGE,
    category: "bo-loc-thay-the",
    brand: "Xiaomi",
    rating: 4.5,
    reviews: 567,
    badge: "sale",
    stock: 60
  },
  {
    id: "23",
    name: "Bộ lọc Sharp FP-J80EV",
    price: 1290000,
    originalPrice: 1790000,
    discount: 28,
    image: PRODUCT_IMAGE,
    category: "bo-loc-thay-the",
    brand: "Sharp",
    rating: 4.6,
    reviews: 234,
    stock: 45
  },

  // Phụ kiện
  {
    id: "24",
    name: "Remote điều khiển máy lọc không khí",
    price: 290000,
    originalPrice: 390000,
    discount: 26,
    image: PRODUCT_IMAGE,
    category: "phu-kien-may-loc",
    brand: "Generic",
    rating: 4.3,
    reviews: 123,
    stock: 80
  },
  {
    id: "25",
    name: "Cảm biến chất lượng không khí",
    price: 1490000,
    originalPrice: 1990000,
    discount: 25,
    image: PRODUCT_IMAGE,
    category: "phu-kien-may-loc",
    brand: "Generic",
    rating: 4.4,
    reviews: 89,
    stock: 35
  },
];

