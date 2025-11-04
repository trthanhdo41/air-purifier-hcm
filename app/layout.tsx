import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hơi Thở Xanh - Máy lọc không khí chính hãng, Giá tốt",
  description: "Hơi Thở Xanh - Chuyên máy lọc không khí chính hãng, công nghệ HEPA, Ion, Carbon tiên tiến. Lọc 99.97% bụi mịn, vi khuẩn, virus. Bảo vệ sức khỏe gia đình bạn.",
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

