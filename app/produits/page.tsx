"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, X } from "lucide-react";

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
const WHATSAPP_NUMBER = "221783674719";

const categories: CategoryFilter[] = [
  "Tous",
  "Savons",
  "Soins du visage",
  "Soins du corps",
  "Cheveux",
  "Packs",
];

const categoryIcons: Record<CategoryFilter, string> = {
  Tous: "🌿",
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

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
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
  const existing = cart.find((item) => item.id === product.id);

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

  localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<PreviewProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);

  // Produits ajoutés par Gnilane (Supabase)
  const [dbProducts, setDbProducts] = useState<PreviewProduct[]>([]);
  const logoClicks = useRef<number[]>([]);

  // Les nouveaux produits d'abord, puis les produits d'origine
  const allProducts = useMemo(
    () => [...dbProducts, ...previewProducts],
    [dbProducts]
  );

  // 5 clics rapides sur le logo = accès secret à l'espace Gnilane
  const handleLogoClick = () => {
    const now = Date.now();
    logoClicks.current = [
      ...logoClicks.current.filter((t) => now - t < 2500),
      now,
    ];

    if (logoClicks.current.length >= 5) {
      logoClicks.current = [];
      router.push("/admin-produits");
    }
  };

  // INITIALISATION
  useEffect(() => {
    setCartCount(countCart(readCart()));

    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) =>
        setDbProducts(Array.isArray(data.products) ? data.products : [])
      )
      .catch(() => { });
  }, []);

  // SCROLL
  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // NOTIFICATION
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // FERMER LES FENÊTRES AVEC ÉCHAP + BLOQUER LE SCROLL
  useEffect(() => {
    if (!selectedImage && !selectedProduct) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
        setSelectedProduct(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedImage, selectedProduct]);

  // RECHERCHE ET FILTRES
  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesCategory =
        activeCategory === "Tous" || product.category === activeCategory;

      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        (product.description ?? "").toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, normalizedSearch, allProducts]);

  // AJOUTER AU PANIER
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

  // ACHETER MAINTENANT / COMMANDER SUR COMMANDE
  const buyNow = (product: PreviewProduct) => {
    if (!product.stock) {
      setToast("Ce produit est momentanément indisponible.");
      return;
    }

    const updatedCart = saveProductToCart(product);
    setCartCount(countCart(updatedCart));
    router.push("/panier");
  };

  // NOMBRE DE PRODUITS PAR CATÉGORIE
  const getCategoryCount = (category: CategoryFilter) => {
    if (category === "Tous") return allProducts.length;
    return allProducts.filter((product) => product.category === category).length;
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Bonjour Beauté Bio by Gnilane, je souhaite avoir des renseignements sur vos produits."
  )}`;

  return (
    <main className="min-h-screen overflow-hidden bg-[#F4FAF5] text-[#1A2E24]">
      <style jsx global>{`
        @keyframes beauty-fade {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes beauty-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .beauty-fade { animation: beauty-fade 0.6s ease-out both; }
        .beauty-float { animation: beauty-float 5s ease-in-out infinite; }
        .beauty-scroll { scrollbar-width: none; }
        .beauty-scroll::-webkit-scrollbar { display: none; }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          .beauty-fade, .beauty-float { animation: none !important; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#D3E8D9] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo + nom : 5 clics rapides = espace privé de Gnilane */}
          <div
            onClick={handleLogoClick}
            className="flex cursor-default select-none items-center gap-3"
          >
            <img
              src="/logo.jpg"
              alt="Logo Beauté Bio by Gnilane"
              draggable={false}
              className="h-12 w-12 rounded-full border-2 border-[#D4AF37] bg-white object-contain p-0.5 shadow-lg"
            />
            <div>
              <p className="font-serif text-lg font-bold text-[#1B4332] sm:text-xl">
                Beauté Bio
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#2D6A4F]">
                By Gnilane
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-semibold text-[#4A5F54] transition hover:text-[#2D6A4F] sm:block"
            >
              Accueil
            </Link>
            <Link
              href="/panier"
              className="flex items-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1B4332]"
            >
              🛍️ Mon panier
              {cartCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F5D76E] px-1.5 text-xs font-bold text-[#1B4332]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F2D20] via-[#1B4332] to-[#2D6A4F]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#B7E4C7]/30" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#52B788]/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <span className="beauty-fade inline-flex rounded-full border border-[#B7E4C7]/70 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B7E4C7]">
            Bienvenue chez nous
          </span>
          <h1 className="mt-7 font-serif text-4xl font-bold leading-tight text-white sm:text-6xl">
            Beauté Bio
            <span className="mt-2 block text-[#B7E4C7]">by Gnilane</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#E3F3E8] sm:text-lg">
            Découvrez notre collection de savons, soins du visage, soins du corps
            et produits au Mbeurbeuff. Prenez soin de votre beauté au quotidien.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
              {allProducts.length} produits
            </span>
            <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
              {categories.length - 1} catégories
            </span>
            <span className="rounded-full border border-[#F5D76E]/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-[#F5D76E]">
              🌿 Soins & beauté
            </span>
          </div>
          <a
            href="#catalogue"
            className="mt-10 inline-flex items-center gap-3 rounded-full border-2 border-[#B7E4C7] bg-white px-9 py-4 text-sm font-bold text-[#1B4332] shadow-xl transition hover:-translate-y-1 hover:bg-[#F4FAF5]"
          >
            Découvrir nos produits <span>↓</span>
          </a>
        </div>
      </section>

      {/* RECHERCHE ET CATÉGORIES */}
      <section
        id="catalogue"
        className="sticky top-[70px] z-30 border-b border-[#D3E8D9] bg-[#F4FAF5]/95 py-4 shadow-sm backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative mx-auto mb-4 max-w-xl">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-[#2D6A4F]">
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un produit..."
              aria-label="Rechercher un produit"
              className="w-full rounded-full border-2 border-[#D3E8D9] bg-white py-3 pl-12 pr-5 text-sm text-[#1A2E24] outline-none transition placeholder:text-[#7A8F83] focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10"
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
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${active
                      ? "border-2 border-[#D4AF37] bg-[#2D6A4F] text-white shadow-md"
                      : "border-2 border-[#D3E8D9] bg-white text-[#4A5F54] hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
                      }`}
                  >
                    <span>{categoryIcons[category]}</span>
                    {category}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${active
                        ? "bg-white/25 text-white"
                        : "bg-[#E3F3E8] text-[#1B4332]"
                        }`}
                    >
                      {getCategoryCount(category)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="relative px-4 pb-24 pt-12 sm:px-6">
        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#B7E4C7]/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2D6A4F]">
                Notre sélection
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-[#1B4332] sm:text-4xl">
                {activeCategory === "Tous" ? "Tous nos produits" : activeCategory}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-px w-12 bg-[#D4AF37]" />
                <span className="text-sm text-[#52B788]">🌿</span>
                <span className="h-px w-12 bg-[#D4AF37]" />
              </div>
            </div>
            <p className="w-fit rounded-full border border-[#52B788]/60 bg-white px-5 py-2.5 text-sm font-semibold text-[#1B4332] shadow-sm">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-[#D3E8D9] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E3F3E8] text-4xl">
                🛍️
              </div>
              <h3 className="mt-6 font-serif text-2xl font-bold text-[#1B4332]">
                Aucun produit trouvé
              </h3>
              <p className="mt-2 text-base text-[#5B7A68]">
                Essayez un autre mot ou une autre catégorie.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("Tous");
                  setSearch("");
                }}
                className="mt-7 rounded-full bg-[#2D6A4F] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#1B4332]"
              >
                Voir tous les produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => {
                const isAdded = addedProduct === product.id;
                const onOrder = product.availability === "sur-commande";

                return (
                  <article
                    key={product.id}
                    className="beauty-fade group flex h-full flex-col overflow-hidden rounded-2xl border border-[#D3E8D9] bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#52B788] hover:shadow-xl hover:shadow-[#2D6A4F]/15 sm:rounded-3xl"
                    style={{ animationDelay: `${(index % 4) * 80}ms` }}
                  >
                    {/* PHOTO */}
                    <button
                      type="button"
                      onClick={() => setSelectedImage(product.image)}
                      aria-label={`Agrandir la photo de ${product.name}`}
                      className="relative block h-44 w-full overflow-hidden bg-[#E3F3E8] sm:h-64"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${onOrder
                          ? "bg-[#FFF3CD] text-[#805B00]"
                          : product.stock
                            ? "bg-white text-[#2E7D32]"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {onOrder
                          ? "Disponible sur commande"
                          : product.stock
                            ? "En stock"
                            : "Indisponible"}
                      </span>
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#1B4332] px-3 py-1.5 text-[11px] font-semibold text-white">
                        {product.category}
                      </span>
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1B4332] opacity-0 shadow-md transition group-hover:opacity-100">
                        ⤢
                      </span>
                    </button>

                    {/* INFORMATIONS */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D6A4F]">
                        Beauté Bio by Gnilane
                      </p>
                      <h3 className="mt-2 min-h-[48px] font-serif text-sm font-bold leading-6 text-[#1A2E24] sm:text-lg">
                        {product.name}
                      </h3>

                      {product.description && (
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#B7D9C2] bg-[#F4FAF5] px-3 py-1.5 text-xs font-bold text-[#1B4332] transition hover:border-[#2D6A4F] hover:bg-[#E3F3E8]"
                        >
                          <BookOpen size={13} />
                          Voir la description
                        </button>
                      )}

                      <div className="mt-auto pt-4">
                        <p className="font-serif text-xl font-bold text-[#987515] sm:text-2xl">
                          {formatPrice(product.price)}
                        </p>

                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={!product.stock}
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white shadow-md transition ${!product.stock
                            ? "cursor-not-allowed bg-gray-400"
                            : isAdded
                              ? "bg-[#40916C]"
                              : "bg-[#2D6A4F] hover:bg-[#1B4332]"
                            }`}
                        >
                          {isAdded ? "Ajouté au panier ✓" : "＋ Ajouter au panier"}
                        </button>

                        <button
                          type="button"
                          onClick={() => buyNow(product)}
                          disabled={!product.stock}
                          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 px-4 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${onOrder
                            ? "border-[#D4AF37] bg-[#FFF6D9] text-[#805B00] hover:bg-[#FCE9A6]"
                            : "border-[#D4AF37] bg-[#F4FAF5] text-[#1B4332] hover:bg-[#E3F3E8]"
                            }`}
                        >
                          {onOrder ? "Disponible sur commande" : "Acheter maintenant"}
                          <ArrowRight size={16} />
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

      {/* CONTACT */}
      <section className="bg-[#1B4332] px-5 py-14 text-center text-white sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#B7E4C7]">
          Beauté Bio by Gnilane
        </p>
        <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
          Une question sur un produit ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#E3F3E8]">
          Contactez-nous pour obtenir des renseignements sur les produits et la gamme disponible sur commande.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#0F2D20]"
        >
          WhatsApp · +221 78 367 47 19
          <ArrowRight size={16} />
        </a>
      </section>

      {/* DESCRIPTION PRODUIT */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-description-title"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0F2D20]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="beauty-fade relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-2 border-[#D4AF37] bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Fermer la description"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#D3E8D9] bg-white text-2xl text-[#1B4332] shadow-sm"
            >
              <X size={20} />
            </button>

            <div className="pr-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2D6A4F]">
                Beauté Bio by Gnilane
              </p>
              <h2
                id="product-description-title"
                className="mt-2 font-serif text-2xl font-bold text-[#1B4332]"
              >
                {selectedProduct.name}
              </h2>
            </div>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="mt-5 h-52 w-full rounded-2xl border border-[#D3E8D9] object-cover sm:h-64"
            />

            <div className="mt-5 rounded-2xl border border-[#D3E8D9] bg-[#F4FAF5] p-4 sm:p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#2D6A4F]">
                Description du produit
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#344B3D]">
                {selectedProduct.description}
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-serif text-2xl font-bold text-[#987515]">
                {formatPrice(selectedProduct.price)}
              </p>
              <button
                type="button"
                onClick={() => {
                  const product = selectedProduct;
                  setSelectedProduct(null);
                  buyNow(product);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2D6A4F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1B4332]"
              >
                {selectedProduct.availability === "sur-commande"
                  ? "Commander sur commande"
                  : "Acheter maintenant"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE AGRANDIE */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo du produit agrandie"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Fermer"
            className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl text-[#1B4332] shadow-lg"
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

      {/* NOTIFICATION PANIER */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-[90] flex w-[92vw] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-[#D4AF37] bg-white px-4 py-3.5 shadow-2xl"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white">
            ✓
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[#2D6A4F]">
              Notification
            </p>
            <p className="truncate text-sm text-[#1A2E24]">{toast}</p>
          </div>
          <Link
            href="/panier"
            className="shrink-0 rounded-full bg-[#1B4332] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0F2D20]"
          >
            Voir
          </Link>
        </div>
      )}

      {/* PANIER FLOTTANT */}
      <Link
        href="/panier"
        aria-label={`Voir mon panier (${cartCount} articles)`}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] text-xl text-white shadow-2xl transition hover:scale-110 hover:bg-[#1B4332]"
      >
        🛍️
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#F5D76E] px-1 text-xs font-bold text-[#1B4332]">
            {cartCount}
          </span>
        )}
      </Link>

      {/* RETOUR EN HAUT */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut"
        className={`fixed bottom-24 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37] bg-white text-[#1B4332] shadow-lg transition ${showTop
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
          }`}
      >
        ↑
      </button>

      {/* FOOTER */}
      <footer className="relative bg-[#0F2D20] px-4 py-10 text-[#E3F3E8]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] font-serif text-sm font-bold text-white">
              BB
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-white">Beauté Bio</p>
              <p className="text-xs text-[#B7E4C7]">by Gnilane</p>
            </div>
          </Link>
          <p className="text-xs text-[#CFE6D6]">
            © {new Date().getFullYear()} Beauté Bio by Gnilane. Tous droits réservés.
          </p>
          <Link
            href="/panier"
            className="text-sm font-semibold text-[#B7E4C7] transition hover:text-white"
          >
            Voir mon panier →
          </Link>
        </div>
      </footer>
    </main>
  );
}