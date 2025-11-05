"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CounterAnimationProps {
  value: number | string;
  duration?: number;
  className?: string;
}

export default function CounterAnimation({ value, duration = 1.5, className = "" }: CounterAnimationProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Nếu value là string (đã format), không animate
    if (typeof value === 'string') {
      setDisplayValue(0);
      return;
    }

    setIsAnimating(true);
    const startValue = 0;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000; // seconds
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  // Nếu value là string, render trực tiếp
  if (typeof value === 'string') {
    return <span className={className}>{value}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toLocaleString('vi-VN')}
    </motion.span>
  );
}

