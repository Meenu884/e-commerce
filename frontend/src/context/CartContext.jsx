import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total_cents: 0 });

  const refresh = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total_cents: 0 });
      return;
    }
    try {
      const data = await api.getCart();
      setCart(data);
    } catch {
      // ignore — likely logged out
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(productId, quantity = 1) {
    const data = await api.addToCart(productId, quantity);
    setCart(data);
  }

  async function updateItem(productId, quantity) {
    const data = await api.updateCartItem(productId, quantity);
    setCart(data);
  }

  async function removeItem(productId) {
    const data = await api.removeCartItem(productId);
    setCart(data);
  }

  async function clear() {
    await api.clearCart();
    setCart({ items: [], total_cents: 0 });
  }

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, itemCount, addItem, updateItem, removeItem, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
