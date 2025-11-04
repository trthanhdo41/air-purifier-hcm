"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import NewsSection from "./NewsSection";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('status', 'active')
          .order('order_index', { ascending: true });
        
        if (!error && data && data.length > 0) {
          setFaqs(data as FAQ[]);
        } else {
          setFaqs([]);
        }
      } catch (e) {
        console.error('Error loading FAQs:', e);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, []);

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Câu hỏi thường gặp về máy lọc không khí</h2>
        
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* FAQ Left Column */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : faqs.length === 0 ? (
              <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                <p className="text-gray-500 text-lg">Chưa có câu hỏi thường gặp</p>
              </div>
            ) : (
              faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200"
                initial={false}
              >
                <motion.button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors group"
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.998 }}
                  transition={{ duration: 0.05 }}
                >
                  <span className="font-semibold text-gray-900 pr-4 group-hover:text-sky-500 transition-colors">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <ChevronDown 
                      className="w-5 h-5 text-gray-600 flex-shrink-0 group-hover:text-sky-500" 
                    />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        height: { duration: 0.2, ease: "easeInOut" },
                        opacity: { duration: 0.15, ease: "easeInOut" }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              ))
            )}
          </div>

          {/* News Right Column */}
          <div className="hidden lg:block">
            <NewsSection />
          </div>
        </div>
      </div>
    </div>
  );
}

