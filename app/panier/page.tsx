"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Package,
  Truck,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

import LocationPicker from "@/components/forms/LocationPicker";
import WavePaymentButton from "@/components/cart/WavePaymentButton";

/* ------------------------------------------------------------------ */
/*  CONFIG VIDÉO (mêmes fichiers que les autres pages)                 */
/*    public/videos/cosmetiques.mp4                                    */
/*    public/videos/cosmetiques.webm (optionnel)                       */
/* ------------------------------------------------------------------ */
const VIDEO_MP4 = "/videos/cosmetiques.mp4";
const VIDEO_WEBM = "/videos/cosmetiques.webm";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  option?: string;
};

type DeliveryInfo = {
  distance: number;
  duration: number;
  price: number | null;
};

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
export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const [videoFailed, setVideoFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // CHARGEMENT DU PANIER
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      setCart([]);
      setLoaded(true);
      return;
    }

    try {
      const parsedCart: unknown = JSON.parse(savedCart);

      if (Array.isArray(parsedCart)) {
        setCart(parsedCart as CartItem[]);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Impossible de charger le panier :", error);
      setCart([]);
    }

    setLoaded(true);
  }, []);

  // Annulation automatique de la confirmation "Vider le panier"
  useEffect(() => {
    if (!confirmClear) return;

    const timer = window.setTimeout(() => setConfirmClear(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmClear]);

  // SAUVEGARDE DU PANIER
  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // MODIFIER LA QUANTITÉ
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      saveCart(cart.filter((item) => item.id !== id));
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );

    saveCart(updatedCart);
  };

  // SUPPRIMER UN ARTICLE
  const removeItem = (id: string) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  // VIDER LE PANIER
  const clearCart = () => {
    setCart([]);
    setDelivery(null);
    setConfirmClear(false);
    localStorage.removeItem("cart");
  };

  // VIDÉO
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

  // CALCULS
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = delivery?.price ?? null;
  const total = subtotal + (deliveryFee ?? 0);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // INFORMATIONS DE LIVRAISON
  const handleDeliveryCalculated = (info: DeliveryInfo | null) => {
    setDelivery(info);
  };

  // MESSAGE WHATSAPP
  const whatsappMessage = [
    "Bonjour Adama, je souhaite commander les produits suivants :",
    "",
    ...cart.map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ${(
          item.price * item.quantity
        ).toLocaleString("fr-FR")} FCFA`
    ),
    "",
    `Sous-total : ${subtotal.toLocaleString("fr-FR")} FCFA`,
    delivery
      ? `Distance routière : ${delivery.distance.toFixed(2)} km`
      : "Distance : Non calculée",
    delivery ? `Durée estimée : ${delivery.duration} minutes` : "",
    deliveryFee !== null
      ? `Livraison : ${deliveryFee.toLocaleString("fr-FR")} FCFA`
      : "Livraison : À confirmer",
    "",
    deliveryFee !== null
      ? `TOTAL : ${total.toLocaleString("fr-FR")} FCFA`
      : `TOTAL PRODUITS : ${subtotal.toLocaleString("fr-FR")} FCFA (hors livraison)`,
    "",
    "Merci.",
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappLink =
    "https://wa.me/221776811311?text=" + encodeURIComponent(whatsappMessage);

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

        @keyframes sn-pop {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes sn-item-in {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        .sn-pop {
          animation: sn-pop 0.35s ease;
        }

        .sn-item-in {
          animation: sn-item-in 0.5s ease-out both;
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
          .sn-pop,
          .sn-item-in {
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

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#F5DCE7] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C2185B]">
                L'élégance au quotidien
              </p>
            </div>
          </Link>

          <Link
            href="/produits"
            className="sn-shine inline-flex items-center gap-2 rounded-full border-2 border-[#C2185B] px-4 py-2.5 text-sm font-semibold text-[#C2185B] transition duration-300 hover:bg-[#C2185B] hover:text-white sm:px-5"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Continuer mes achats</span>
            <span className="sm:hidden">Achats</span>
          </Link>
        </div>
      </header>

      {/* HERO AVEC VIDÉO */}
      <section className="relative isolate overflow-hidden bg-[#450525]">
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
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

        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#450525]/85 via-[#880E4F]/70 to-[#450525]/90" />

        <div className="sn-spin-slow pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-dashed border-[#F5D76E]/40" />
        <div className="sn-float pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#E91E63]/25 blur-3xl" />
        <Petals />
        <Sparkles color="#F5D76E" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 text-center sm:px-8 sm:pb-20 sm:pt-16">
          <div className="sn-fade-up inline-flex items-center gap-3 rounded-full border border-[#F5D76E]/70 bg-[#450525]/70 px-5 py-2 backdrop-blur">
            <span className="sn-pulse h-2 w-2 rounded-full bg-[#F5D76E]" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#F5D76E]">
              Votre expérience Sope Naby
            </span>
          </div>

          <h1 className="sn-fade-up sn-delay-1 mt-6 font-serif text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl">
            Mon <span className="sn-gold-text">panier</span>
          </h1>

          <p className="sn-fade-up sn-delay-2 mx-auto mt-4 max-w-lg text-base leading-8 text-[#FCE4EC]">
            Vérifiez votre sélection, calculez la livraison et finalisez votre
            commande.
          </p>

          {cart.length > 0 && (
            <div className="sn-fade-up sn-delay-2 mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
              <ShoppingBag size={17} className="text-[#F5D76E]" />
              {itemCount} article{itemCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {!videoFailed && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5D76E]/70 bg-[#450525]/70 text-white backdrop-blur transition hover:bg-[#C2185B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5D76E]/70 bg-[#450525]/70 text-white backdrop-blur transition hover:bg-[#C2185B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}

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

      {/* CONTENU */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="sn-float pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#F8BBD0]/30 blur-3xl" />
        <Sparkles />

        {/* CHARGEMENT */}
        {!loaded ? (
          <div className="relative flex justify-center py-24" role="status">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#880E4F]">
              <span className="sn-spin-slow inline-block h-6 w-6 rounded-full border-2 border-[#D4AF37] border-t-transparent" />
              Chargement de votre panier...
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* PANIER VIDE */
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-[#F0D3DF] bg-white px-6 py-16 text-center shadow-lg">
            <div className="sn-spin-slow absolute -right-16 -top-16 h-44 w-44 rounded-full border border-dashed border-[#D4AF37]/40" />
            <Sparkles />

            <div className="sn-float relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#FCE4EC]">
              <ShoppingBag size={34} className="text-[#C2185B]" />
            </div>

            <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#C2185B]">
              Sope Naby
            </p>

            <h2 className="relative mt-3 font-serif text-3xl font-bold text-[#880E4F]">
              Votre panier est vide
            </h2>

            <p className="relative mx-auto mt-4 max-w-sm text-base leading-7 text-[#67566A]">
              Votre prochaine découverte vous attend. Parcourez notre
              collection et ajoutez vos articles préférés.
            </p>

            <Link
              href="/produits"
              className="sn-shine relative mt-8 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#880E4F]"
            >
              Découvrir la collection
              <ArrowRight size={18} className="text-[#F5D76E]" />
            </Link>
          </div>
        ) : (
          <div className="relative grid items-start gap-8 lg:grid-cols-[1fr_380px]">
            {/* COLONNE PRINCIPALE */}
            <section className="min-w-0">
              {/* EN-TÊTE PRODUITS */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C2185B]">
                    Ma sélection
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-[#880E4F]">
                    Vos articles
                  </h2>
                  <p className="mt-1 text-sm text-[#67566A]">
                    {cart.length} référence{cart.length > 1 ? "s" : ""} dans
                    votre panier
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    confirmClear ? clearCart() : setConfirmClear(true)
                  }
                  className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] sm:text-sm ${
                    confirmClear
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-[#F0D3DF] bg-white text-[#A4506C] hover:border-red-400 hover:text-red-600"
                  }`}
                >
                  <Trash2 size={15} />
                  {confirmClear ? "Confirmer ?" : "Vider le panier"}
                </button>
              </div>

              {/* LISTE DES PRODUITS */}
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <article
                    key={item.id}
                    className="sn-item-in group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#F0D3DF] bg-white p-3.5 shadow-sm transition duration-300 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#C2185B]/10 sm:gap-5 sm:p-4"
                    style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
                  >
                    {/* IMAGE */}
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-[#F0D3DF] bg-[#FCE4EC] sm:h-28 sm:w-24">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">
                          🌸
                        </div>
                      )}
                    </div>

                    {/* INFORMATIONS */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C2185B]">
                        Sope Naby
                      </p>

                      <h3 className="mt-1 line-clamp-2 font-serif text-base font-bold leading-6 text-[#2B1A2B] sm:text-lg">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#67566A]">
                        {item.price.toLocaleString("fr-FR")} FCFA / unité
                      </p>

                      {/* QUANTITÉ */}
                      <div className="mt-3 flex items-center">
                        <div className="flex items-center rounded-full border-2 border-[#F0D3DF] bg-[#FFF5F9] p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label={`Diminuer la quantité de ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#880E4F] transition hover:bg-[#C2185B] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
                          >
                            <Minus size={15} />
                          </button>

                          <span
                            key={item.quantity}
                            className="sn-pop min-w-9 text-center text-base font-bold text-[#2B1A2B]"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label={`Augmenter la quantité de ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#880E4F] transition hover:bg-[#C2185B] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PRIX ET SUPPRESSION */}
                    <div className="flex flex-shrink-0 flex-col items-end justify-between gap-6 self-stretch">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Supprimer ${item.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0D3DF] text-[#A4506C] transition hover:border-red-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
                      >
                        <Trash2 size={17} />
                      </button>

                      <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#67566A]">
                          Total
                        </p>

                        <p className="mt-0.5 font-serif text-lg font-bold text-[#B8860B] sm:text-xl">
                          {(item.price * item.quantity).toLocaleString("fr-FR")}
                          <span className="ml-1 text-xs font-bold">FCFA</span>
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* LIVRAISON */}
              <Reveal>
                <section className="mt-8 overflow-hidden rounded-2xl border border-[#F0D3DF] bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-[#F5E3EB] bg-gradient-to-r from-[#FFF5F9] to-white px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#FCE4EC] text-[#C2185B]">
                        <MapPin size={20} />
                      </div>

                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#880E4F]">
                          Livraison
                        </h2>
                        <p className="text-sm text-[#67566A]">
                          Calcul des frais selon votre position
                        </p>
                      </div>
                    </div>

                    <span
                      className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
                        delivery
                          ? "border-[#2E7D32]/40 bg-[#E8F5E9] text-[#2E7D32]"
                          : "border-[#D4AF37]/60 bg-[#FFF8E1] text-[#8A6D0B]"
                      }`}
                    >
                      {delivery ? "✓ Calculée" : "À calculer"}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <LocationPicker
                      onDeliveryCalculated={handleDeliveryCalculated}
                    />
                  </div>
                </section>
              </Reveal>

              {/* AJOUTER DES PRODUITS */}
              <Link
                href="/produits"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#244A87] transition hover:text-[#C2185B]"
              >
                <ArrowLeft
                  size={16}
                  className="transition group-hover:-translate-x-1"
                />
                Ajouter d'autres produits
              </Link>
            </section>

            {/* RÉCAPITULATIF */}
            <aside className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-white shadow-xl shadow-[#C2185B]/10">
                <div className="sn-gradient-flow relative overflow-hidden px-6 py-5">
                  <div className="sn-spin-slow absolute -right-10 -top-10 h-32 w-32 rounded-full border border-dashed border-[#F5D76E]/50" />
                  <Sparkles color="#F5D76E" />

                  <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-[#F5D76E]">
                    Récapitulatif
                  </p>

                  <h2 className="relative mt-1 font-serif text-2xl font-bold text-white">
                    Votre commande
                  </h2>
                </div>

                <div className="p-6">
                  {/* ARTICLES */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-[#514454]">
                      <Package size={17} className="text-[#C2185B]" />
                      Articles ({itemCount})
                    </span>

                    <span className="text-sm font-bold">
                      {subtotal.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>

                  {/* LIVRAISON */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-[#514454]">
                      <Truck size={17} className="text-[#C2185B]" />
                      Livraison
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        deliveryFee === null ? "text-[#8A6D0B]" : ""
                      }`}
                    >
                      {deliveryFee !== null
                        ? `${deliveryFee.toLocaleString("fr-FR")} FCFA`
                        : "À calculer"}
                    </span>
                  </div>

                  {delivery && (
                    <p className="mt-2 text-xs text-[#67566A]">
                      {delivery.distance.toFixed(2)} km · environ{" "}
                      {delivery.duration} min
                    </p>
                  )}

                  {/* TOTAL */}
                  <div className="mt-5 border-t-2 border-dashed border-[#F0D3DF] pt-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold">Total</span>

                      <span
                        key={total}
                        className="sn-pop font-serif text-2xl font-bold text-[#B8860B]"
                      >
                        {total.toLocaleString("fr-FR")}{" "}
                        <span className="text-sm">FCFA</span>
                      </span>
                    </div>

                    {deliveryFee === null && (
                      <p className="mt-4 rounded-xl border border-[#D4AF37]/50 bg-[#FFF8E1] p-3 text-xs leading-5 text-[#7A5F08]">
                        Le montant affiché ne comprend pas encore les frais de
                        livraison. Indiquez votre position pour les calculer.
                      </p>
                    )}
                  </div>

                  {/* WHATSAPP */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sn-shine sn-pulse mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-4 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#880E4F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E]"
                  >
                    Commander sur WhatsApp
                    <ArrowRight size={17} className="text-[#F5D76E]" />
                  </a>

                  {/* WAVE */}
                  <div className="mt-3">
                    <WavePaymentButton
                      cart={cart}
                      onPaymentConfirmed={clearCart}
                    />
                  </div>

                  {/* CONFIANCE */}
                  <div className="mt-6 border-t border-[#F5E3EB] pt-5">
                    <div className="flex items-center justify-center gap-2 text-[#880E4F]">
                      <ShieldCheck size={18} className="text-[#D4AF37]" />
                      <p className="text-xs font-bold uppercase tracking-[0.15em]">
                        Merci de votre confiance
                      </p>
                    </div>

                    <p className="mt-2 text-center text-xs leading-5 text-[#67566A]">
                      Votre satisfaction est notre priorité. Les frais de
                      livraison dépendent de votre localisation.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-[#450525] px-5 py-10 text-center">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <Sparkles color="#F5D76E" />

        <div className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-sm font-bold text-white">
          SN
        </div>

        <p className="relative mt-3 font-serif text-xl font-bold text-white">
          Sope Naby
        </p>

        <p className="relative mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F5D76E]">
          L'élégance au quotidien
        </p>

        <p className="relative mt-5 text-xs text-[#EBCBD9]">
          © {new Date().getFullYear()} Sope Naby. Tous droits réservés.
        </p>
      </footer>
    </main>
  );
}