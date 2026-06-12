import { create } from 'zustand';
import { User, StoreSettings, CartItem } from '../types';

interface AppState {
  user: User | null;
  storeSettings: StoreSettings | null;
  cart: CartItem[];
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setStoreSettings: (settings: StoreSettings | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  storeSettings: null,
  cart: [],
  isAdmin: false,
  setUser: (user) => set({ user, isAdmin: user?.role === 'admin' }),
  setStoreSettings: (settings) => set({ storeSettings: settings }),
  addToCart: (item) => set((state) => {
    const existing = state.cart.find(i => i.id === item.id);
    if (existing) {
      return { 
        cart: state.cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      };
    }
    return { cart: [...state.cart, item] };
  }),
  removeFromCart: (productId) => set((state) => ({ cart: state.cart.filter(i => i.id !== productId) })),
  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(i => i.id === productId ? { ...i, quantity } : i)
  })),
  clearCart: () => set({ cart: [] }),
}));
