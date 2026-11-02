
"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/types";

export default function AddToCartButton({
  product,
}: {
  product: Product;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      disabled={!product.stock}
      className="flex-1 bg-gold text-white rounded-full py-2 text-sm hover:opacity-90 transition disabled:opacity-40"
    >
      {added ? "Ajoute" : "Ajouter au panier"}
    </button>
  );
}
