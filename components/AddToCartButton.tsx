"use client";

import { useState } from "react";

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
};

type Props = {
    product: {
        id: string;
        name: string;
        price?: number;
        image?: string | null;
        image_url?: string | null;
        stock?: number;
    };
};

const CART_KEY = "cart";

export default function AddToCartButton({ product }: Props) {
    const [added, setAdded] = useState(false);
    const unavailable = product.stock !== undefined && product.stock <= 0;

    function addToCart() {
        if (unavailable) return;

        let cart: CartItem[] = [];
        try {
            const saved = localStorage.getItem(CART_KEY);
            const parsed: unknown = saved ? JSON.parse(saved) : [];
            cart = Array.isArray(parsed) ? (parsed as CartItem[]) : [];
        } catch {
            cart = [];
        }

        const existing = cart.find((item) => item.id === product.id);

        const updated = existing
            ? cart.map((item) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
            : [
                ...cart,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price ?? 0,
                    quantity: 1,
                    image: product.image ?? product.image_url ?? null,
                },
            ];

        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2000);
    }

    return (
        <button
            type="button"
            onClick={addToCart}
            disabled={unavailable}
            className="w-full rounded-full bg-[#2D6A4F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
            {unavailable
                ? "Indisponible"
                : added
                    ? "Ajouté au panier ✓"
                    : "Ajouter au panier"}
        </button>
    );
}