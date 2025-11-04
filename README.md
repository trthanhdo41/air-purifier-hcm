# 🌿 Hơi Thở Xanh - Máy lọc không khí

E-commerce website chuyên về máy lọc không khí chính hãng, được xây dựng với công nghệ tiên tiến nhất.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Image Optimization**: Next.js Image

## ✨ Features

- ✅ Modern & Responsive UI/UX
- ✅ Product Categories & Filtering
- ✅ Product Search
- ✅ Sort by Price, Popularity, Deals
- ✅ Brand Filtering
- ✅ Product Cards with Discount Badges
- ✅ Smooth Animations
- ✅ Shopping Cart (UI Ready)
- ✅ Professional Layout
- ✅ SEO Optimized
- ✅ Fast Performance

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Open Browser

Mở [http://localhost:3000](http://localhost:3000) để xem website.

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── Footer.tsx          # Footer
│   ├── CategorySection.tsx # Category grid
│   ├── ProductCard.tsx     # Product item
│   └── FilterBar.tsx       # Filter & sort bar
├── data/
│   ├── categories.ts       # Category data
│   └── products.ts         # Product data
├── types/
│   └── index.ts            # TypeScript types
├── lib/
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## 🎨 Customization

### Thêm sản phẩm mới

Edit file `data/products.ts`:

```typescript
{
  id: "new-id",
  name: "Tên sản phẩm",
  price: 1000000,
  originalPrice: 1500000,
  discount: 33,
  image: "url-to-image",
  category: "category-slug",
  brand: "Brand Name",
  badge: "hot",
  stock: 10
}
```

### Thêm danh mục mới

Edit file `data/categories.ts`:

```typescript
{
  id: "category-id",
  name: "Tên danh mục",
  slug: "category-slug",
  icon: "🎯"
}
```

### Thay đổi màu sắc

Edit file `tailwind.config.ts` để thay đổi theme colors.

## 🔜 Next Steps (Backend)

- Add API routes
- Database integration (MongoDB/PostgreSQL)
- User authentication
- Shopping cart functionality
- Order management
- Payment gateway integration
- Admin dashboard

## 📝 License

MIT License - feel free to use for your projects!

## 👨‍💻 Development

Built with ❤️ using modern web technologies.

