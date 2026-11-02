"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product, CartItem } from "@/types";

type CartContextType = {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    variantName?: string,
    unitPrice?: number
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "sope-naby-cart";

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier :", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du panier :", error);
    }
  }, [items, loaded]);

  function addItem(
    product: Product,
    quantity: number = 1,
    variantName?: string,
    unitPrice?: number
  ) {
    const finalPrice =
      unitPrice ??
      product.price ??
      product.variants?.[0]?.price ??
      0;

    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.variantName === variantName
      );

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id &&
          item.variantName === variantName
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          quantity,
          variantName,
          unitPrice: finalPrice,
        },
      ];
    });
  }

  function updateQuantity(
    productId: string,
    quantity: number
  ) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter(
            (item) => item.product.id !== productId
          )
        : prev.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
    );
  }

  function removeItem(productId: string) {
    setItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce(
    (total, item) =>
      total + item.unitPrice * item.quantity,
    0
  );

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart doit être utilisé dans un CartProvider"
    );
  }

  return context;
}