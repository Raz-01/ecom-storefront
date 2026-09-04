"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types/domain";

type CartState = {
  lines: CartLine[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

/**
 * Client-side cart, persisted to localStorage so it survives a refresh.
 * This is purely a UI convenience — quantities entered here are always
 * re-validated and re-priced server-side at checkout (see
 * `computeOrderTotals`), so nothing here needs to be trusted.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addItem: (productId, quantity = 1) => {
        const lines = get().lines;
        const existing = lines.find((l) => l.productId === productId);
        if (existing) {
          set({
            lines: lines.map((l) =>
              l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l,
            ),
          });
        } else {
          set({ lines: [...lines, { productId, quantity }] });
        }
      },

      removeItem: (productId) => {
        set({ lines: get().lines.filter((l) => l.productId !== productId) });
      },

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          lines: get().lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
        });
      },

      clear: () => set({ lines: [] }),
    }),
    { name: "cart" },
  ),
);
