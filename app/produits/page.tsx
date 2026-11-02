"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  previewProducts,
  type PreviewProduct,
  type ProductCategory,
} from "@/lib/products-preview";

// ==================================================
// TYPES
// ==================================================

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type CategoryFilter = "Tous" | ProductCategory;

// ==================================================
// CONFIGURATION
// ==================================================

const CART_KEY = "cart";

const categories: CategoryFilter[] = [
  "Tous",
  "Savons",
  "Soins du visage",
  "Soins du corps",
  "Cheveux",
  "Packs",
];

const categoryIcons: Record<CategoryFilter, string> = {
  Tous: "✦",
  Savons: "◇",
  "Soins du visage": "♡",
  "Soins du corps": "❀",
  Cheveux: "✧",
  Packs: "🎁",
};

const formatPrice = (price: number) =>
  `${price.toLocaleString("fr-FR")} FCFA`;

// ==================================================
// GESTION DU PANIER
// ==================================================

function readCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function countCart(cart: CartItem[]) {
  return cart.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );
}

function saveProductToCart(product: PreviewProduct): CartItem[] {
  const cart = readCart();

  const existing = cart.find(
    (item) => item.id === product.id
  );

  let updatedCart: CartItem[];

  if (existing) {
    updatedCart = cart.map((item) =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  } else {
    updatedCart = [
      ...cart,
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      },
    ];
  }

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(updatedCart)
  );

  return updatedCart;
}

// ==================================================
// PAGE PRODUITS
// ==================================================

export default function ProduitsPage() {
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);

  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("Tous");

  const [search, setSearch] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const [addedProduct, setAddedProduct] =
    useState<string | null>(null);

  const [showTop, setShowTop] = useState(false);

  // ==================================================
  // INITIALISATION
  // ==================================================

  useEffect(() => {
    setCartCount(countCart(readCart()));
  }, []);

  // ==================================================
  // SCROLL
  // ==================================================

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  // ==================================================
  // NOTIFICATION
  // ==================================================

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [toast]);

  // ==================================================
  // FERMER IMAGE
  // ==================================================

  useEffect(() => {
    if (!selectedImage) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);
  }, [selectedImage]);

  // ==================================================
  // RECHERCHE ET FILTRES
  // ==================================================

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return previewProducts.filter((product) => {
      const matchesCategory =
        activeCategory === "Tous" ||
        product.category === activeCategory;

      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, normalizedSearch]);

  // ==================================================
  // AJOUTER AU PANIER
  // ==================================================

  const addToCart = (product: PreviewProduct) => {
    if (!product.stock) {
      setToast("Ce produit est momentanément indisponible.");
      return;
    }

    const updatedCart = saveProductToCart(product);

    setCartCount(countCart(updatedCart));

    setAddedProduct(product.id);

    setToast(`${product.name} ajouté au panier !`);
  };

  // ==================================================
  // ACHETER MAINTENANT
  // ==================================================

  const buyNow = (product: PreviewProduct) => {
    if (!product.stock) {
      setToast("Ce produit est momentanément indisponible.");
      return;
    }

    const updatedCart = saveProductToCart(product);

    setCartCount(countCart(updatedCart));

    router.push("/panier");
  };

  // ==================================================
  // NOMBRE DE PRODUITS PAR CATÉGORIE
  // ==================================================

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === "Tous") {
      return previewProducts.length;
    }

    return previewProducts.filter(
      (product) => product.category === category
    ).length;
  };

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF8FB] text-[#2B1A2B]">

      <style jsx global>{`
        @keyframes beauty-fade {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes beauty-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .beauty-fade {
          animation: beauty-fade 0.6s ease-out both;
        }

        .beauty-float {
          animation: beauty-float 5s ease-in-out infinite;
        }

        .beauty-scroll {
          scrollbar-width: none;
        }

        .beauty-scroll::-webkit-scrollbar {
          display: none;
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          .beauty-fade,
          .beauty-float {
            animation: none !important;
          }

          html {
            scroll-behavior: auto;
          }
        }
      `}</style>

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="sticky top-0 z-40 border-b border-[#F2DCE6] bg-white/95 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-lg font-bold text-white shadow-md">
              BB
            </div>

            <div>
              <p className="font-serif text-lg font-bold text-[#880E4F] sm:text-xl">
                Beauté Bio
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C2185B]">
                By Gnilane
              </p>
            </div>

          </Link>

          <div className="flex items-center gap-3">

            <Link
              href="/"
              className="hidden text-sm font-semibold text-[#514454] transition hover:text-[#C2185B] sm:block"
            >
              Accueil
            </Link>

            <Link
              href="/panier"
              className="flex items-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#880E4F]"
            >
              🛍️

              Mon panier

              {cartCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F5D76E] px-1.5 text-xs font-bold text-[#880E4F]">
                  {cartCount}
                </span>
              )}
            </Link>

          </div>

        </div>

      </header>

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#450525] via-[#880E4F] to-[#C2185B]">

        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#F5D76E]/30" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#F8BBD0]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 sm:py-28">

          <span className="beauty-fade inline-flex rounded-full border border-[#F5D76E]/70 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#F5D76E]">
            Bienvenue chez nous
          </span>

          <h1 className="mt-7 font-serif text-4xl font-bold leading-tight text-white sm:text-6xl">
            Beauté Bio

            <span className="mt-2 block text-[#F5D76E]">
              by Gnilane
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#FCE4EC] sm:text-lg">
            Découvrez notre collection de savons, soins du visage,
            soins du corps et produits au Mbeurbeuff.
            Prenez soin de votre beauté au quotidien.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">

            <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
              {previewProducts.length} produits
            </span>

            <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
              {categories.length - 1} catégories
            </span>

          </div>

          <a
            href="#catalogue"
            className="mt-10 inline-flex items-center gap-3 rounded-full border-2 border-[#F5D76E] bg-white px-9 py-4 text-sm font-bold text-[#880E4F] shadow-xl transition hover:-translate-y-1 hover:bg-[#FFF0F6]"
          >
            Découvrir nos produits
            <span>↓</span>
          </a>

        </div>

      </section>

      {/* ==========================================
          RECHERCHE ET CATÉGORIES
      ========================================== */}

      <section
        id="catalogue"
        className="sticky top-[70px] z-30 border-b border-[#F0D3DF] bg-[#FFF8FB]/95 py-4 shadow-sm backdrop-blur-xl"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="relative mx-auto mb-4 max-w-xl">

            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-[#C2185B]">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un produit..."
              aria-label="Rechercher un produit"
              className="w-full rounded-full border-2 border-[#F0D3DF] bg-white py-3 pl-12 pr-5 text-sm text-[#2B1A2B] outline-none transition placeholder:text-[#9A8497] focus:border-[#C2185B] focus:ring-4 focus:ring-[#C2185B]/10"
            />

          </div>

          <div className="beauty-scroll overflow-x-auto">

            <div className="flex min-w-max gap-2 pb-1 sm:justify-center">

              {categories.map((category) => {
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "border-2 border-[#D4AF37] bg-[#C2185B] text-white shadow-md"
                        : "border-2 border-[#F0D3DF] bg-white text-[#514454] hover:border-[#C2185B] hover:text-[#C2185B]"
                    }`}
                  >
                    <span>{categoryIcons[category]}</span>

                    {category}

                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-[#FCE4EC] text-[#880E4F]"
                    }`}>
                      {getCategoryCount(category)}
                    </span>

                  </button>
                );
              })}

            </div>

          </div>

        </div>

      </section>

      {/* ==========================================
          CATALOGUE DES PRODUITS
      ========================================== */}

      <section className="relative px-4 pb-24 pt-12 sm:px-6">

        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#F8BBD0]/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C2185B]">
                Notre sélection
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-[#880E4F] sm:text-4xl">
                {activeCategory === "Tous"
                  ? "Tous nos produits"
                  : activeCategory}
              </h2>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-px w-12 bg-[#D4AF37]" />
                <span className="text-sm text-[#D4AF37]">✦</span>
                <span className="h-px w-12 bg-[#D4AF37]" />
              </div>

            </div>

            <p className="w-fit rounded-full border border-[#D4AF37]/60 bg-white px-5 py-2.5 text-sm font-semibold text-[#880E4F] shadow-sm">
              {filteredProducts.length} produit
              {filteredProducts.length > 1 ? "s" : ""}
            </p>

          </div>

          {filteredProducts.length === 0 ? (

            <div className="rounded-3xl border border-[#F0D3DF] bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FCE4EC] text-4xl">
                🛍️
              </div>

              <h3 className="mt-6 font-serif text-2xl font-bold text-[#880E4F]">
                Aucun produit trouvé
              </h3>

              <p className="mt-2 text-base text-[#67566A]">
                Essayez un autre mot ou une autre catégorie.
              </p>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("Tous");
                  setSearch("");
                }}
                className="mt-7 rounded-full bg-[#C2185B] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#880E4F]"
              >
                Voir tous les produits
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map((product, index) => {

                const isAdded = addedProduct === product.id;

                return (
                  <article
                    key={product.id}
                    className="beauty-fade group flex h-full flex-col overflow-hidden rounded-2xl border border-[#F0D3DF] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-xl sm:rounded-3xl"
                    style={{
                      animationDelay: `${(index % 4) * 80}ms`,
                    }}
                  >

                    {/* PHOTO */}

                    <button
                      type="button"
                      onClick={() => setSelectedImage(product.image)}
                      aria-label={`Agrandir la photo de ${product.name}`}
                      className="relative block h-44 w-full overflow-hidden bg-[#FCE4EC] sm:h-64"
                    >

                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${
                          product.stock
                            ? "bg-white text-[#2E7D32]"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock ? "En stock" : "Indisponible"}
                      </span>

                      <span className="absolute bottom-3 left-3 rounded-full bg-[#880E4F] px-3 py-1.5 text-[11px] font-semibold text-white">
                        {product.category}
                      </span>

                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#880E4F] opacity-0 shadow-md transition group-hover:opacity-100">
                        ⤢
                      </span>

                    </button>

                    {/* INFORMATIONS */}

                    <div className="flex flex-1 flex-col p-4 sm:p-5">

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C2185B]">
                        Beauté Bio by Gnilane
                      </p>

                      <h3 className="mt-2 min-h-[48px] font-serif text-sm font-bold leading-6 text-[#2B1A2B] sm:text-lg">
                        {product.name}
                      </h3>

                      {product.details && (
                        <p className="mt-2 text-xs leading-5 text-[#67566A]">
                          {product.details}
                        </p>
                      )}

                      <div className="mt-auto pt-4">

                        {/* PRIX */}

                        <p className="font-serif text-xl font-bold text-[#B8860B] sm:text-2xl">
                          {formatPrice(product.price)}
                        </p>

                        {/* AJOUTER AU PANIER */}

                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={!product.stock}
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white shadow-md transition ${
                            !product.stock
                              ? "cursor-not-allowed bg-gray-400"
                              : isAdded
                                ? "bg-[#2E7D32]"
                                : "bg-[#C2185B] hover:bg-[#880E4F]"
                          }`}
                        >
                          {isAdded ? "Ajouté au panier ✓" : "＋ Ajouter au panier"}
                        </button>

                        {/* ACHETER MAINTENANT */}

                        <button
                          type="button"
                          onClick={() => buyNow(product)}
                          disabled={!product.stock}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#FFF5F8] px-4 py-3 text-sm font-bold text-[#880E4F] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FCE4EC] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Acheter maintenant
                          <span aria-hidden="true">→</span>
                        </button>

                      </div>

                    </div>

                  </article>
                );

              })}

            </div>

          )}

        </div>

      </section>

      {/* ==========================================
          IMAGE AGRANDIE
      ========================================== */}

      {selectedImage && (

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo du produit agrandie"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >

          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Fermer"
            className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl text-[#880E4F] shadow-lg"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Produit agrandi"
            className="max-h-[85vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />

        </div>

      )}

      {/* ==========================================
          NOTIFICATION PANIER
      ========================================== */}

      {toast && (

        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-[90] flex w-[92vw] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-[#D4AF37] bg-white px-4 py-3.5 shadow-2xl"
        >

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C2185B] text-white">
            ✓
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[#C2185B]">
              Notification
            </p>

            <p className="truncate text-sm text-[#2B1A2B]">
              {toast}
            </p>
          </div>

          <Link
            href="/panier"
            className="shrink-0 rounded-full bg-[#880E4F] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#450525]"
          >
            Voir
          </Link>

        </div>

      )}

      {/* ==========================================
          PANIER FLOTTANT
      ========================================== */}

      <Link
        href="/panier"
        aria-label={`Voir mon panier (${cartCount} articles)`}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] text-xl text-white shadow-2xl transition hover:scale-110 hover:bg-[#880E4F]"
      >

        🛍️

        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#F5D76E] px-1 text-xs font-bold text-[#880E4F]">
            {cartCount}
          </span>
        )}

      </Link>

      {/* ==========================================
          RETOUR EN HAUT
      ========================================== */}

      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        aria-label="Retour en haut"
        className={`fixed bottom-24 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37] bg-white text-[#880E4F] shadow-lg transition ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        ↑
      </button>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer className="relative bg-[#450525] px-4 py-10 text-[#FCE4EC]">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">

          <Link href="/" className="inline-flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-sm font-bold text-white">
              BB
            </div>

            <div>
              <p className="font-serif text-lg font-bold text-white">
                Beauté Bio
              </p>

              <p className="text-xs text-[#F5D76E]">
                by Gnilane
              </p>
            </div>

          </Link>

          <p className="text-xs text-[#EBCBD9]">
            © {new Date().getFullYear()} Beauté Bio by Gnilane.
            Tous droits réservés.
          </p>

          <Link
            href="/panier"
            className="text-sm font-semibold text-[#F5D76E] transition hover:text-white"
          >
            Voir mon panier →
          </Link>

        </div>

      </footer>

    </main>
  );
}