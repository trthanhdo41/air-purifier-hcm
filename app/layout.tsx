import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đồ Gia Dụng - Chính hãng, Giá tốt",
  description: "Mua đồ gia dụng chính hãng, giá tốt. Robot hút bụi, nồi chiên không dầu, máy lọc không khí và nhiều sản phẩm khác.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

