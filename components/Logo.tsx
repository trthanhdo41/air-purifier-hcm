"use client";

import Image from "next/image";

interface LogoProps {
  variant?: 'horizontal' | 'white' | 'blue' | 'black';
  className?: string;
}

export default function Logo({ variant = 'horizontal', className = "" }: LogoProps) {
  const getLogoSrc = () => {
    switch (variant) {
      case 'horizontal':
        return '/font/logo%20web%20ngang.svg';
      case 'white':
        return '/font/Ch%E1%BB%AF%20tr%E1%BA%AFng%20R.svg';
      case 'blue':
        return '/font/Ch%E1%BB%AF%20xanh%20R.svg';
      case 'black':
        return '/font/Ch%E1%BB%AF%20%C4%91en%20R.svg';
      default:
        return '/font/logo%20web%20ngang.svg';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        src={getLogoSrc()}
        alt="Hơi Thở Xanh Logo"
        width={200}
        height={60}
        className="h-auto w-auto max-w-full"
        priority
        onError={(e) => {
          console.log('Logo load error:', e);
          // Fallback to text if image fails
        }}
      />
    </div>
  );
}

// Component for bubbles decoration
export function Bubbles({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/font/Bong bóng.svg"
        alt="Bubbles decoration"
        width={100}
        height={100}
        className="h-auto w-auto max-w-full"
      />
    </div>
  );
}
