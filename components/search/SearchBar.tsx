"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface Product {
  id: string;
  name?: string;
  title?: string;
  category?: string;
}

interface SearchBarProps {
  products: Product[];
  onResults: (results: Product[]) => void;
}

export default function SearchBar({
  products,
  onResults,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSearch(value: string) {
    setQuery(value);

    const search = value.toLowerCase().trim();

    const results = products.filter((product) => {
      const name = (product.name || product.title || "").toLowerCase();
      const category = (product.category || "").toLowerCase();

      return (
        name.includes(search) ||
        category.includes(search)
      );
    });

    onResults(results);
  }

  return (
    <div className="relative w-full max-w-xl">

      <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm focus-within:border-amber-600">

        <Search className="h-5 w-5 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full bg-transparent text-sm outline-none"
        />

        {query && (
          <button
            onClick={() => handleSearch("")}
            aria-label="Effacer la recherche"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}

      </div>

    </div>
  );
}