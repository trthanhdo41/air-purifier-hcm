import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  buyNowItems: CartItem[]; // Items cho "Mua ngay"
  setBuyNowItems: (items: CartItem[]) => void;
  clearBuyNowItems: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalSavings: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      buyNowItems: [],

      setBuyNowItems: (items: CartItem[]) => {
        set({ buyNowItems: items });
      },

      clearBuyNowItems: () => {
        set({ buyNowItems: [] });
      },

      addItem: (product: Product) => {
        const items = get().items;
        const existingItem = items.find(item => item.product.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { product, quantity: 1 }]
          });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter(item => item.product.id !== productId)
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      resetCart: () => {
        set({ items: [], isOpen: false });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
        }, 0);
      },

      getTotalSavings: () => {
        return get().items.reduce((total, item) => {
          if (item.product.originalPrice) {
            return total + ((item.product.originalPrice - item.product.price) * item.quantity);
          }
          return total;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
