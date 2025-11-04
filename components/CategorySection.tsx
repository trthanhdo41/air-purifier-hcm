"use client";

import { useState, useEffect } from "react";
import React from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface CategorySectionProps {
  title: string;
  categoryIds: string[];
  onCategoryClick: (categoryId: string) => void;
}

export default function CategorySection({ title, categoryIds, onCategoryClick }: CategorySectionProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (!error && data && data.length > 0) {
          // Map icon names to components
          const LucideIcons = require('lucide-react');
          const iconMap: { [key: string]: any } = {
            'Wind': LucideIcons.Wind,
            'Zap': LucideIcons.Zap,
            'Shield': LucideIcons.Shield,
            'Sun': LucideIcons.Sun,
            'Droplets': LucideIcons.Droplets,
            'Home': LucideIcons.Home,
            'Activity': LucideIcons.Activity,
            'Leaf': LucideIcons.Leaf,
            'Sparkles': LucideIcons.Sparkles,
            'Filter': LucideIcons.Filter,
            'AirVent': LucideIcons.Filter,
          };
          const mappedCategories = data.map(cat => ({
            ...cat,
            icon: iconMap[cat.icon] || LucideIcons.Wind
          }));
          setCategories(mappedCategories);
        } else {
          setCategories([]);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const sectionCategories = categories.filter(cat => categoryIds.includes(cat.id));

  if (loading) {
    return <div className="mb-16">Loading...</div>;
  }

  if (sectionCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
          {title}
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </h2>
        <button className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 group">
          Xem tất cả
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3">
        {sectionCategories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            onClick={() => onCategoryClick(category.id)}
            className="group relative bg-white rounded-2xl p-5 shadow-soft hover:shadow-large transition-all duration-300 border border-gray-100/50 card-hover flex flex-col items-center gap-3 overflow-hidden"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 text-5xl group-hover:scale-110 transition-transform duration-300">
              {category.icon && React.createElement(category.icon, { className: "w-12 h-12" })}
            </div>
            <span className="relative z-10 text-sm text-center font-semibold text-gray-700 group-hover:text-red-600 transition-colors leading-tight">
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
