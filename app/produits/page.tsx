"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { previewProducts } from "@/lib/products-preview";

/* ------------------------------------------------------------------ */
/*  CONFIG VIDÉO (mêmes fichiers que la page d'accueil)               */
/*    public/videos/cosmetiques.mp4                                    */
/*    public/videos/cosmetiques.webm (optionnel)                       */
/* ------------------------------------------------------------------ */
const VIDEO_MP4 = "/videos/cosmetiques.mp4";
const VIDEO_WEBM = "/videos/cosmetiques.webm";

type Product = (typeof previewProducts)[number];

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  option?: string;
};

type ProductOption = {
  name: string;
  price: number;
};

type CategoryFilter =
  | "Tous"
  | "Parfums"
  | "Diw & Crèmes"
  | "Thiouraye"
  | "Savons & Hygiène"
  | "Accessoires & Maison";

const CATEGORY_ICONS: Record<CategoryFilter, string> = {
  Tous: "✦",
  Parfums: "❀",
  "Diw & Crèmes": "♡",
  Thiouraye: "❋",
  "Savons & Hygiène": "◇",
  "Accessoires & Maison": "⌂",
};

/* =========================
   OPTIONS AUTOMATIQUES
========================= */

function getProductOptions(details?: string): ProductOption[] {
  if (!details) return [];

  if (!details.includes("/") && !/\bou\b/i.test(details)) {
    return [];
  }

  const parts = details
    .split(/\s*\/\s*|\s+\bou\b\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const options: ProductOption[] = [];

  for (const part of parts) {
    const match = part.match(/(.+?)\s+(\d[\d\s.]*)\s*F(?:CFA)?$/i);

    if (!match) continue;

    const name = match[1].trim();
    const price = Number(match[2].replace(/[\s.]/g, ""));

    if (name && !Number.isNaN(price)) {
      options.push({ name, price });
    }
  }

  return options;
}

/* =========================
   TOTAL DES PACKS
========================= */

function getDetailsTotal(details?: string): number | null {
  if (!details || !details.includes("+")) {
    return null;
  }

  const prices = details.match(/\d[\d\s.]*(?=\s*F(?:CFA)?)/gi);

  if (!prices) return null;

  const total = prices.reduce((sum, price) => {
    const value = Number(price.replace(/[\s.]/g, ""));
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  return total > 0 ? total : null;
}

/* =========================
   CATÉGORISATION
========================= */

function getProductCategory(product: Product): Exclude<CategoryFilter, "Tous"> {
  const text = `${product.name} ${product.details ?? ""}`.toLowerCase();

  if (
    text.includes("thiouraye") ||
    text.includes("bukhoor") ||
    text.includes("oute")
  ) {
    return "Thiouraye";
  }

  if (
    text.includes("balais") ||
    text.includes("lave bois") ||
    text.includes("lave vitre") ||
    text.includes("mouchoir") ||
    text.includes("softcare") ||
    text.includes("poussin lit") ||
    text.includes("poussin canapé") ||
    text.includes("appareil électrique") ||
    text.includes("andeu courant")
  ) {
    return "Accessoires & Maison";
  }

  if (
    text.includes("savon") ||
    text.includes("dentifrice") ||
    text.includes("shampoing") ||
    text.includes("gel douche")
  ) {
    return "Savons & Hygiène";
  }

  if (
    text.includes("diw") ||
    text.includes("crème") ||
    text.includes("creme") ||
    text.includes("vaseline") ||
    text.includes("glycérine") ||
    text.includes("huile")
  ) {
    return "Diw & Crèmes";
  }

  if (
    text.includes("parfum") ||
    text.includes("cologne") ||
    text.includes("déodorant")
  ) {
    return "Parfums";
  }

  if (text.includes("pack")) {
    return "Diw & Crèmes";
  }

  return "Parfums";
}

/* =========================
   PANIER (lecture sécurisée)
========================= */

function readCart(): CartItem[] {
  try {
    const saved = localStorage.getItem("cart");
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function countCart(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/* ------------------------------------------------------------------ */
/*  COMPOSANT : apparition au scroll                                   */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sn-reveal ${visible ? "sn-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPOSANTS DÉCORATIFS                                              */
/* ------------------------------------------------------------------ */
const SPARKLES = [
  { top: "10%", left: "5%", size: 14, delay: 0 },
  { top: "22%", left: "46%", size: 10, delay: 0.8 },
  { top: "34%", left: "93%", size: 16, delay: 1.6 },
  { top: "58%", left: "4%", size: 12, delay: 0.4 },
  { top: "70%", left: "52%", size: 9, delay: 2.1 },
  { top: "82%", left: "88%", size: 14, delay: 1.2 },
  { top: "14%", left: "74%", size: 12, delay: 1.9 },
];

function Sparkles({ color = "#D4AF37" }: { color?: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="sn-twinkle absolute"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            color,
            animationDelay: `${s.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <path d="M12 0 14.6 9.4 24 12 14.6 14.6 12 24 9.4 14.6 0 12 9.4 9.4Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

const PETALS = [
  { left: "10%", delay: 0, duration: 14, size: 14 },
  { left: "28%", delay: 5, duration: 17, size: 10 },
  { left: "47%", delay: 9, duration: 15, size: 12 },
  { left: "66%", delay: 2, duration: 18, size: 9 },
  { left: "84%", delay: 7, duration: 16, size: 13 },
];

function Petals() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="sn-petal absolute -top-6 block rounded-[70%_0_70%_0] bg-gradient-to-br from-[#F8BBD0] to-[#E91E63]/60"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.4,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function ProduitsPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [buyProduct, setBuyProduct] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("Tous");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [videoFailed, setVideoFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Compteur de panier au chargement */
  useEffect(() => {
    setCartCount(countCart(readCart()));
  }, []);

  /* Scroll : progression + bouton haut */
  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(height > 0 ? (top / height) * 100 : 0);
      setShowTop(top > 700);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Fermer l'image avec Échap */
  useEffect(() => {
    if (!selectedImage) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedImage]);

  /* Fiche produit : Échap pour fermer + blocage du scroll de la page */
  useEffect(() => {
    if (!detailProduct) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailProduct(null);
    };

    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [detailProduct]);

  /* Disparition automatique de la notification */
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* =========================
     PANIER
  ========================= */

  const addToCart = (
    product: Product,
    option?: ProductOption,
    quantity = 1
  ) => {
    const cart = readCart();

    const productId = option ? `${product.id}-${option.name}` : product.id;
    const productName = option
      ? `${product.name} - ${option.name}`
      : product.name;
    const productPrice = option ? option.price : product.price;

    const existingProduct = cart.find((item) => item.id === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        quantity,
        image: product.image,
        ...(option ? { option: option.name } : {}),
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    setCartCount(countCart(cart));
    setAddedProduct(productId);
    setBuyProduct(productId);
    setToast(productName);
  };

  const buyNow = () => {
    window.location.href = "/panier";
  };

  /* =========================
     VIDÉO
  ========================= */

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  /* =========================
     FILTRE + RECHERCHE
  ========================= */

  const categories: CategoryFilter[] = [
    "Tous",
    "Parfums",
    "Diw & Crèmes",
    "Thiouraye",
    "Savons & Hygiène",
    "Accessoires & Maison",
  ];

  const categoryCounts = categories.reduce(
    (acc, category) => {
      acc[category] =
        category === "Tous"
          ? previewProducts.length
          : previewProducts.filter(
              (product) => getProductCategory(product) === category
            ).length;
      return acc;
    },
    {} as Record<CategoryFilter, number>
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = previewProducts.filter((product) => {
    const matchCategory =
      activeCategory === "Tous" ||
      getProductCategory(product) === activeCategory;

    const matchSearch =
      normalizedSearch === "" ||
      `${product.name} ${product.details ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch);

    return matchCategory && matchSearch;
  });

  /* =========================
     FICHE PRODUIT (choix des options)
  ========================= */

  const detailOptions = detailProduct
    ? getProductOptions(detailProduct.details)
    : [];

  const chosenOption =
    detailOptions.find((option) => option.name === selectedOption) ?? null;

  const openProduct = (product: Product) => {
    const productOptions = getProductOptions(product.details);

    setDetailProduct(product);
    setSelectedOption(
      productOptions.length === 1 ? productOptions[0].name : null
    );
    setQty(1);
  };

  const closeProduct = () => setDetailProduct(null);

  const confirmChoice = (goToCart: boolean) => {
    if (!detailProduct || !chosenOption) return;

    addToCart(detailProduct, chosenOption, qty);

    if (goToCart) {
      window.location.href = "/panier";
    } else {
      closeProduct();
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF8FB] text-[#2B1A2B]">
      <style jsx global>{`
        @keyframes sn-fade-up {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sn-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes sn-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(212, 175, 55, 0);
          }
        }

        @keyframes sn-twinkle {
          0%,
          100% {
            opacity: 0.15;
            transform: scale(0.6) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) rotate(45deg);
          }
        }

        @keyframes sn-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translate3d(30px, 45vh, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(-20px, 110vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes sn-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sn-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes sn-gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes sn-sweep {
          from {
            transform: translateX(-120%) skewX(-20deg);
          }
          to {
            transform: translateX(260%) skewX(-20deg);
          }
        }

        @keyframes sn-ring-pop {
          0% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes sn-toast-in {
          from {
            opacity: 0;
            transform: translate(-50%, 20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        @keyframes sn-pop {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.35);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes sn-zoom-in {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .sn-fade-up {
          animation: sn-fade-up 0.85s ease-out both;
        }

        .sn-delay-1 {
          animation-delay: 0.15s;
        }

        .sn-delay-2 {
          animation-delay: 0.3s;
        }

        .sn-delay-3 {
          animation-delay: 0.45s;
        }

        .sn-float {
          animation: sn-float 5s ease-in-out infinite;
        }

        .sn-pulse {
          animation: sn-pulse 2.5s infinite;
        }

        .sn-twinkle {
          animation: sn-twinkle 3.6s ease-in-out infinite;
        }

        .sn-petal {
          animation: sn-fall linear infinite;
          will-change: transform;
        }

        .sn-spin-slow {
          animation: sn-spin 28s linear infinite;
        }

        .sn-gold-text {
          background-image: linear-gradient(
            100deg,
            #f5d76e 0%,
            #fff3c4 30%,
            #d4af37 55%,
            #fff3c4 80%,
            #f5d76e 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: sn-shimmer 6s linear infinite;
        }

        .sn-gradient-flow {
          background: linear-gradient(
            135deg,
            #880e4f,
            #c2185b,
            #450525,
            #c2185b
          );
          background-size: 300% 300%;
          animation: sn-gradient-flow 10s ease infinite;
        }

        .sn-shine {
          position: relative;
          overflow: hidden;
        }

        .sn-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.45),
            transparent
          );
          transform: translateX(-120%) skewX(-20deg);
          pointer-events: none;
        }

        .sn-shine:hover::after {
          animation: sn-sweep 0.9s ease;
        }

        .sn-ring-pop {
          animation: sn-ring-pop 2.4s ease-out infinite;
        }

        .sn-toast {
          animation: sn-toast-in 0.35s ease-out both;
        }

        .sn-pop {
          animation: sn-pop 0.4s ease;
        }

        .sn-zoom-in {
          animation: sn-zoom-in 0.3s ease-out both;
        }

        @keyframes sn-sheet-in {
          from {
            opacity: 0;
            transform: translateY(48px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sn-sheet {
          animation: sn-sheet-in 0.4s ease-out both;
        }

        .sn-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .sn-reveal.sn-in {
          opacity: 1;
          transform: translateY(0);
        }

        .sn-no-scrollbar {
          scrollbar-width: none;
        }

        .sn-no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          .sn-fade-up,
          .sn-float,
          .sn-pulse,
          .sn-twinkle,
          .sn-petal,
          .sn-spin-slow,
          .sn-gold-text,
          .sn-gradient-flow,
          .sn-ring-pop,
          .sn-toast,
          .sn-pop,
          .sn-zoom-in,
          .sn-sheet {
            animation: none !important;
          }

          .sn-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }

          html {
            scroll-behavior: auto;
          }
        }
      `}</style>

      {/* BARRE DE PROGRESSION */}
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[70] h-1 bg-gradient-to-r from-[#C2185B] via-[#E91E63] to-[#D4AF37]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* =========================
          HEADER
      ========================= */}

      <header className="sticky top-0 z-40 border-b border-[#F5DCE7] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <span className="sn-ring-pop absolute inset-0 rounded-full border border-[#D4AF37]" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-base font-bold text-white shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-105">
                SN
              </div>
            </div>

            <div>
              <p className="font-serif text-xl font-bold tracking-tight text-[#880E4F]">
                Sope Naby
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C2185B]">
                Boutique
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
              className="sn-shine flex items-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-4 py-2.5 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#880E4F] sm:px-5"
            >
              <span aria-hidden="true">🛍️</span>
              <span>Mon panier</span>

              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="sn-pop flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F5D76E] px-1.5 text-xs font-bold text-[#880E4F]"
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* =========================
          HERO AVEC VIDÉO
      ========================= */}

      <section className="relative isolate overflow-hidden bg-[#450525]">
        {/* Vidéo en arrière-plan */}
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={previewProducts[0]?.image}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setVideoFailed(true)}
          >
            <source src={VIDEO_WEBM} type="video/webm" />
            <source
              src={VIDEO_MP4}
              type="video/mp4"
              onError={() => setVideoFailed(true)}
            />
          </video>
        ) : (
          <div className="sn-gradient-flow absolute inset-0 -z-20" />
        )}

        {/* Voile pour garder le texte bien lisible */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#450525]/85 via-[#880E4F]/65 to-[#450525]/90" />

        {/* Décorations */}
        <div className="sn-spin-slow pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-dashed border-[#F5D76E]/40" />
        <div className="sn-float pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#E91E63]/25 blur-3xl" />
        <Petals />
        <Sparkles color="#F5D76E" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24">
          <div className="sn-fade-up inline-flex items-center gap-3 rounded-full border border-[#F5D76E]/70 bg-[#450525]/70 px-5 py-2 backdrop-blur">
            <span className="sn-pulse h-2 w-2 rounded-full bg-[#F5D76E]" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#F5D76E]">
              L'univers Sope Naby
            </span>
          </div>

          <h1 className="sn-fade-up sn-delay-1 mt-7 font-serif text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-6xl">
            Découvrez notre
            <span className="sn-gold-text block">collection</span>
          </h1>

          <p className="sn-fade-up sn-delay-2 mx-auto mt-6 max-w-xl text-base leading-8 text-[#FCE4EC] sm:text-lg">
            Parfums, soins, thiouraye, hygiène et accessoires. Choisissez vos
            produits et commandez en quelques clics.
          </p>

          <div className="sn-fade-up sn-delay-3 mx-auto mt-9 flex max-w-md flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
              {previewProducts.length} produits
            </span>
            <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
              {categories.length - 1} catégories
            </span>
            <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
              Mbour · Tali Carreaux
            </span>
          </div>

          <a
            href="#catalogue"
            className="sn-shine sn-fade-up sn-delay-3 mt-10 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#F5D76E] bg-[#C2185B] px-9 py-4 text-sm font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#880E4F]"
          >
            Voir les produits
            <span className="text-[#F5D76E]">↓</span>
          </a>
        </div>

        {/* Contrôles vidéo */}
        {!videoFailed && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5D76E]/70 bg-[#450525]/70 text-xs text-white backdrop-blur transition hover:bg-[#C2185B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
            >
              {playing ? "❚❚" : "▶"}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5D76E]/70 bg-[#450525]/70 text-sm text-white backdrop-blur transition hover:bg-[#C2185B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        )}

        {/* Vague décorative */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-10 w-full text-[#FFF8FB] sm:h-14"
        >
          <path
            fill="currentColor"
            d="M0,30 C240,70 480,0 720,28 C960,56 1200,6 1440,34 L1440,60 L0,60 Z"
          />
        </svg>
      </section>

      {/* =========================
          RECHERCHE + CATÉGORIES
      ========================= */}

      <section
        id="catalogue"
        className="sticky top-[70px] z-30 border-b border-[#F0D3DF] bg-[#FFF8FB]/95 py-4 shadow-sm backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Recherche */}
          <div className="relative mx-auto mb-4 max-w-xl">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-[#C2185B]"
            >
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un produit..."
              aria-label="Rechercher un produit"
              className="w-full rounded-full border-2 border-[#F0D3DF] bg-white py-3 pl-12 pr-5 text-sm text-[#2B1A2B] shadow-sm outline-none transition placeholder:text-[#9A8497] focus:border-[#C2185B] focus:ring-4 focus:ring-[#C2185B]/10"
            />
          </div>

          {/* Catégories */}
          <div className="sn-no-scrollbar overflow-x-auto">
            <div className="flex min-w-max gap-2 pb-1 sm:justify-center">
              {categories.map((category) => {
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] ${
                      active
                        ? "border-2 border-[#D4AF37] bg-[#C2185B] text-white shadow-lg shadow-[#C2185B]/25"
                        : "border-2 border-[#F0D3DF] bg-white text-[#514454] hover:border-[#C2185B] hover:text-[#C2185B]"
                    }`}
                  >
                    <span aria-hidden="true">{CATEGORY_ICONS[category]}</span>
                    {category}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        active
                          ? "bg-white/25 text-white"
                          : "bg-[#FCE4EC] text-[#880E4F]"
                      }`}
                    >
                      {categoryCounts[category]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          PRODUITS
      ========================= */}

      <section className="relative px-4 pb-24 pt-12 sm:px-6">
        <div className="sn-float pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-[#F8BBD0]/30 blur-3xl" />
        <div className="sn-spin-slow pointer-events-none absolute -left-32 top-1/2 h-80 w-80 rounded-full border border-dashed border-[#D4AF37]/30" />
        <Sparkles />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C2185B]">
                Notre sélection
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-[#880E4F] sm:text-4xl">
                {activeCategory === "Tous" ? "Tous nos produits" : activeCategory}
              </h2>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-px w-12 bg-[#D4AF37]" />
                <span className="sn-twinkle text-sm text-[#D4AF37]">✦</span>
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
              <div className="sn-float mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#FCE4EC] text-4xl">
                🛍️
              </div>

              <p className="mt-6 font-serif text-2xl font-bold text-[#880E4F]">
                Aucun produit trouvé
              </p>

              <p className="mt-2 text-base text-[#67566A]">
                Essayez un autre mot ou une autre catégorie.
              </p>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("Tous");
                  setSearch("");
                }}
                className="sn-shine mt-7 rounded-full bg-[#C2185B] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#880E4F]"
              >
                Voir tous les produits
              </button>
            </div>
          ) : (
            <div
              key={`${activeCategory}-${normalizedSearch}`}
              className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProducts.map((product, index) => {
                const options = getProductOptions(product.details);
                const detailsTotal = getDetailsTotal(product.details);

                const isAdded = addedProduct === product.id;
                const isBuyVisible = buyProduct === product.id;

                const category = getProductCategory(product);

                return (
                  <Reveal key={product.id} delay={(index % 4) * 90}>
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#F0D3DF] bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#C2185B]/15 sm:rounded-3xl">
                      {/* PHOTO */}
                      <button
                        type="button"
                        onClick={() => setSelectedImage(product.image)}
                        className="relative block h-48 w-full cursor-zoom-in overflow-hidden bg-[#FCE4EC] sm:h-64"
                        aria-label={`Agrandir la photo de ${product.name}`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#450525]/50 via-transparent to-transparent" />

                        {/* reflet au survol */}
                        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-1000 group-hover:translate-x-full" />

                        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/80 bg-white px-3 py-1.5 text-[11px] font-bold text-[#2E7D32] shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
                          En stock
                        </span>

                        <span className="absolute bottom-3 left-3 rounded-full border border-[#F5D76E]/80 bg-[#880E4F] px-3 py-1.5 text-[11px] font-semibold text-white shadow">
                          {category}
                        </span>

                        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-base text-[#880E4F] opacity-0 shadow-md transition duration-300 group-hover:opacity-100">
                          ⤢
                        </span>
                      </button>

                      {/* CONTENU */}
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2185B]">
                          Sope Naby
                        </p>

                        <h3 className="mt-2 min-h-[48px] font-serif text-base font-bold leading-6 text-[#2B1A2B] sm:min-h-[56px] sm:text-lg">
                          {product.name}
                        </h3>

                        {/* DÉTAILS DES PACKS */}
                        {product.details && options.length === 0 && (
                          <div className="mt-3 rounded-xl border border-[#F0D3DF] bg-[#FFF5F9] px-3 py-3">
                            <p className="text-xs leading-5 text-[#514454]">
                              {product.details}
                            </p>

                            {detailsTotal !== null && (
                              <div className="mt-2.5 flex items-center justify-between border-t border-[#F0D3DF] pt-2.5">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-[#67566A]">
                                  Total
                                </span>

                                <span className="text-sm font-bold text-[#C2185B]">
                                  {detailsTotal.toLocaleString("fr-FR")} FCFA
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-4">
                          {/* PRIX */}
                          {options.length === 0 && (
                            <p className="font-serif text-xl font-bold text-[#B8860B] sm:text-2xl">
                              {product.price.toLocaleString("fr-FR")}
                              <span className="ml-1.5 text-xs font-bold">
                                FCFA
                              </span>
                            </p>
                          )}

                          {/* ACTION PRODUIT */}
                          {options.length === 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-semibold sm:text-sm ${
                                    isAdded
                                      ? "text-[#C2185B]"
                                      : "text-[#2E7D32]"
                                  }`}
                                >
                                  {isAdded ? "Ajouté ✓" : "Disponible"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => addToCart(product)}
                                  aria-label={`Ajouter ${product.name} au panier`}
                                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D4AF37] text-xl font-medium text-white shadow-md transition duration-300 hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] sm:h-12 sm:w-12 ${
                                    isAdded
                                      ? "bg-[#880E4F]"
                                      : "bg-[#C2185B] hover:bg-[#880E4F]"
                                  }`}
                                >
                                  {isAdded ? "✓" : "+"}
                                </button>
                              </div>

                              <div
                                className={`overflow-hidden transition-all duration-500 ${
                                  isBuyVisible
                                    ? "mt-3 max-h-16 opacity-100"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={buyNow}
                                  tabIndex={isBuyVisible ? 0 : -1}
                                  className="sn-shine flex w-full items-center justify-center gap-2 rounded-full bg-[#880E4F] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#450525] sm:text-sm"
                                >
                                  Acheter maintenant →
                                </button>
                              </div>
                            </div>
                          )}

                          {/* OPTIONS : bouton Choisir */}
                          {options.length > 0 && (
                            <div>
                              <p className="font-serif text-sm font-bold text-[#67566A]">
                                À partir de{" "}
                                <span className="text-xl text-[#B8860B]">
                                  {Math.min(
                                    ...options.map((option) => option.price)
                                  ).toLocaleString("fr-FR")}
                                </span>{" "}
                                <span className="text-xs">FCFA</span>
                              </p>

                              <p className="mt-1 text-xs font-semibold text-[#67566A]">
                                {options.length} choix disponibles
                              </p>

                              <button
                                type="button"
                                onClick={() => openProduct(product)}
                                aria-label={`Choisir une option pour ${product.name}`}
                                className="sn-shine mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-[#C2185B]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#880E4F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
                              >
                                Choisir
                                <span className="text-[#F5D76E]">→</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================
          BANDEAU WHATSAPP
      ========================= */}

      <section className="relative overflow-hidden bg-[#880E4F] px-5 py-16 text-center text-white sm:px-8">
        <div className="sn-spin-slow absolute -right-24 -top-24 h-72 w-72 rounded-full border border-dashed border-[#F5D76E]/30" />
        <div className="sn-float absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#E91E63]/30 blur-3xl" />
        <Sparkles color="#F5D76E" />

        <Reveal>
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F5D76E]">
              Besoin d'aide ?
            </p>

            <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
              Vous ne trouvez pas votre produit ?
            </h2>

            <p className="mt-4 text-base leading-8 text-[#FCE4EC]">
              Écrivez-nous sur WhatsApp, nous vous répondons avec plaisir.
            </p>

            <a
              href="https://wa.me/221776811311"
              target="_blank"
              rel="noopener noreferrer"
              className="sn-pulse sn-shine mt-8 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-9 py-4 text-sm font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#450525]"
            >
              <span className="text-lg text-[#F5D76E]">✆</span>
              WhatsApp · 77 681 13 11
            </a>
          </div>
        </Reveal>
      </section>

      {/* =========================
          FICHE PRODUIT : CHOIX DES OPTIONS
      ========================= */}

      {detailProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Choisir une option pour ${detailProduct.name}`}
          className="fixed inset-0 z-[95] flex items-end justify-center bg-[#240312]/80 backdrop-blur-md sm:items-center sm:p-6"
          onClick={closeProduct}
        >
          <div
            className="sn-sheet relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border-2 border-[#D4AF37] bg-white shadow-2xl sm:rounded-3xl md:flex-row"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Fermer */}
            <button
              type="button"
              onClick={closeProduct}
              aria-label="Fermer"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37] bg-white text-2xl text-[#880E4F] shadow-md transition hover:bg-[#C2185B] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
            >
              ×
            </button>

            {/* Photo */}
            <button
              type="button"
              onClick={() => setSelectedImage(detailProduct.image)}
              aria-label={`Agrandir la photo de ${detailProduct.name}`}
              className="relative h-52 w-full shrink-0 cursor-zoom-in overflow-hidden bg-[#FCE4EC] md:h-auto md:w-2/5"
            >
              <img
                src={detailProduct.image}
                alt={detailProduct.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#450525]/50 via-transparent to-transparent" />

              <span className="absolute bottom-3 left-3 rounded-full border border-[#F5D76E]/80 bg-[#880E4F] px-3 py-1.5 text-[11px] font-semibold text-white shadow">
                {getProductCategory(detailProduct)}
              </span>
            </button>

            {/* Contenu */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2185B]">
                  Sope Naby
                </p>

                <h2 className="mt-2 pr-12 font-serif text-2xl font-bold leading-8 text-[#880E4F] sm:text-3xl">
                  {detailProduct.name}
                </h2>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-px w-10 bg-[#D4AF37]" />
                  <span className="sn-twinkle text-xs text-[#D4AF37]">✦</span>
                  <span className="h-px w-10 bg-[#D4AF37]" />
                </div>

                <p className="mt-5 text-base font-bold text-[#2B1A2B]">
                  Choisissez votre option
                </p>

                <p className="mt-1 text-sm text-[#67566A]">
                  {chosenOption
                    ? "Option sélectionnée. Vous pouvez en changer."
                    : "Touchez l'option que vous souhaitez."}
                </p>

                {/* Options */}
                <div
                  role="radiogroup"
                  aria-label="Options du produit"
                  className="mt-4 space-y-3"
                >
                  {detailOptions.map((option) => {
                    const active = selectedOption === option.name;

                    return (
                      <button
                        key={option.name}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedOption(option.name)}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] ${
                          active
                            ? "border-[#C2185B] bg-[#FFF0F6] shadow-lg shadow-[#C2185B]/15"
                            : "border-[#F0D3DF] bg-white hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                            active
                              ? "border-[#C2185B] bg-[#C2185B] text-white"
                              : "border-[#D9B8C8] bg-white text-transparent"
                          }`}
                        >
                          ✓
                        </span>

                        <span className="min-w-0 flex-1 text-base font-bold leading-6 text-[#2B1A2B]">
                          {option.name}
                        </span>

                        <span className="shrink-0 text-right font-serif text-xl font-bold text-[#B8860B]">
                          {option.price.toLocaleString("fr-FR")}
                          <span className="ml-1 text-xs font-bold">FCFA</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barre d'achat */}
              <div className="border-t-2 border-[#F0D3DF] bg-[#FFF8FB] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-full border-2 border-[#F0D3DF] bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setQty((value) => Math.max(1, value - 1))}
                      aria-label="Diminuer la quantité"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#880E4F] transition hover:bg-[#C2185B] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
                    >
                      −
                    </button>

                    <span
                      key={qty}
                      className="sn-pop min-w-10 text-center text-lg font-bold text-[#2B1A2B]"
                    >
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQty((value) => value + 1)}
                      aria-label="Augmenter la quantité"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#880E4F] transition hover:bg-[#C2185B] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#67566A]">
                      Total
                    </p>

                    <p className="font-serif text-2xl font-bold text-[#B8860B]">
                      {chosenOption
                        ? (chosenOption.price * qty).toLocaleString("fr-FR")
                        : "—"}
                      <span className="ml-1 text-xs font-bold">FCFA</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => confirmChoice(false)}
                    disabled={!chosenOption}
                    className="sn-shine flex items-center justify-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#880E4F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {chosenOption ? "Ajouter au panier" : "Choisissez une option"}
                  </button>

                  <button
                    type="button"
                    onClick={() => confirmChoice(true)}
                    disabled={!chosenOption}
                    className="sn-shine flex items-center justify-center gap-2 rounded-full bg-[#880E4F] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#450525] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Acheter maintenant →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          IMAGE AGRANDIE
      ========================= */}

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo du produit agrandie"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#240312]/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#F5D76E]/60 bg-white/10 text-3xl text-white transition hover:bg-[#C2185B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
            aria-label="Fermer"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Produit agrandi"
            className="sn-zoom-in max-h-[85vh] max-w-[94vw] rounded-2xl border-2 border-[#D4AF37] object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {/* =========================
          NOTIFICATION PANIER
      ========================= */}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="sn-toast fixed bottom-24 left-1/2 z-[90] flex w-[92vw] max-w-md items-center gap-3 rounded-2xl border-2 border-[#D4AF37] bg-white px-4 py-3.5 shadow-2xl"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C2185B] text-white">
            ✓
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[#C2185B]">
              Ajouté au panier
            </p>
            <p className="truncate text-sm text-[#2B1A2B]">{toast}</p>
          </div>

          <Link
            href="/panier"
            className="shrink-0 rounded-full bg-[#880E4F] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#450525]"
          >
            Voir
          </Link>
        </div>
      )}

      {/* =========================
          BOUTONS FLOTTANTS
      ========================= */}

      <Link
        href="/panier"
        aria-label={`Voir mon panier (${cartCount} article${
          cartCount > 1 ? "s" : ""
        })`}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] text-xl text-white shadow-2xl transition hover:scale-110 hover:bg-[#880E4F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
      >
        <span aria-hidden="true">🛍️</span>

        {cartCount > 0 && (
          <span
            key={cartCount}
            className="sn-pop absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-[#F5D76E] px-1 text-xs font-bold text-[#880E4F]"
          >
            {cartCount}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut de la page"
        className={`fixed bottom-24 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37] bg-white text-[#880E4F] shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#880E4F] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        ↑
      </button>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="relative bg-[#450525] px-4 py-10 text-[#FCE4EC]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-sm font-bold text-white">
              SN
            </div>

            <span className="font-serif text-lg font-bold text-white">
              Sope Naby
            </span>
          </Link>

          <p className="text-xs text-[#EBCBD9]">
            © {new Date().getFullYear()} Sope Naby — Tous droits réservés.
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