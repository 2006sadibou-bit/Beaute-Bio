"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Package,
  Truck,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Leaf,
  CheckCircle2,
  XCircle,
  CreditCard,
  Check,
  ChevronDown,
} from "lucide-react";

/* ================================================================
   CONFIGURATION
================================================================ */

const VIDEO_MP4 = "/videos/cosmetiques.mp4";
const VIDEO_WEBM = "/videos/cosmetiques.webm";
const THANKS_VIDEO = "/video32.mp4";

const CART_STORAGE_KEY = "cart";
const WAVE_PENDING_KEY = "wave_pending";
const WHATSAPP_NUMBER = "221783674719";
const WAVE_LINK = "https://pay.wave.com/m/M_sn_aTBQjCw-NQ4B/c/sn/";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  option?: string;
};

type DeliveryMode = "simple" | "groupage";

/* ================================================================
   ANIMATION AU SCROLL
================================================================ */

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
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
      className={`bb-reveal ${visible ? "bb-in" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ================================================================
   DÉCORS : FEUILLES ET ÉTOILES
================================================================ */

const SPARKLES = [
  { top: "10%", left: "5%", size: 14, delay: 0 },
  { top: "34%", left: "93%", size: 16, delay: 1.6 },
  { top: "58%", left: "4%", size: 12, delay: 0.4 },
  { top: "82%", left: "88%", size: 14, delay: 1.2 },
  { top: "14%", left: "74%", size: 12, delay: 1.9 },
];

function Sparkles({ color = "#D4AF37" }: { color?: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {SPARKLES.map((sparkle, index) => (
        <span
          key={index}
          className="bb-twinkle absolute"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            color,
            animationDelay: `${sparkle.delay}s`,
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

const LEAVES = [
  { left: "10%", delay: 0, duration: 14, size: 14 },
  { left: "28%", delay: 5, duration: 17, size: 10 },
  { left: "47%", delay: 9, duration: 15, size: 12 },
  { left: "66%", delay: 2, duration: 18, size: 9 },
  { left: "84%", delay: 7, duration: 16, size: 13 },
];

function Leaves() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {LEAVES.map((leaf, index) => (
        <span
          key={index}
          className="bb-petal absolute -top-6 block rounded-[70%_0_70%_0] bg-gradient-to-br from-[#A5D6A7] to-[#2E7D32]/60"
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size * 1.4,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   EN-TÊTE D'ÉTAPE
================================================================ */

function StepHeader({
  number,
  label,
  title,
  subtitle,
}: {
  number: number;
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#2E7D32] font-serif text-lg font-bold text-white shadow-lg">
        {number}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2E7D32]">
          {label}
        </p>
        <h2 className="mt-0.5 font-serif text-2xl font-bold text-[#14532D]">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-[#4A5E50]">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ================================================================
   CHOIX DU MODE DE LIVRAISON
================================================================ */

function DeliverySection({
  selectedMode,
  onSelect,
}: {
  selectedMode: DeliveryMode | null;
  onSelect: (mode: DeliveryMode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftMode, setDraftMode] = useState<DeliveryMode | null>(selectedMode);

  const options: {
    id: DeliveryMode;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: "simple",
      title: "Livraison simple",
      description:
        "Une livraison individuelle. La disponibilité, les frais et le délai sont confirmés avec vous sur WhatsApp.",
      badge: "Option 1",
    },
    {
      id: "groupage",
      title: "Livraison par groupage",
      description:
        "Votre commande est acheminée par groupage. Les frais et le délai sont confirmés avec vous sur WhatsApp.",
      badge: "Option 2",
    },
  ];

  const selectedOption = options.find((option) => option.id === selectedMode);

  const openOptions = () => {
    setDraftMode(selectedMode);
    setIsOpen((open) => !open);
  };

  const confirmSelection = () => {
    if (!draftMode) return;
    onSelect(draftMode);
    setIsOpen(false);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D3E6CC] bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="beauty-bio-delivery-options"
        onClick={openOptions}
        className="flex w-full items-center justify-between gap-3 border-b border-[#E2F0DC] bg-gradient-to-r from-[#F1F9EE] to-white px-5 py-4 text-left transition hover:bg-[#F5FAF2] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#A5D6A7]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#DCEFD6] text-[#2E7D32]">
            <Truck size={20} />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-lg font-bold text-[#14532D]">
              Livraison
            </span>
            <span className="mt-0.5 block truncate text-sm text-[#4A5E50]">
              {isOpen
                ? "Cochez une option puis confirmez votre choix"
                : selectedOption?.title ?? "Appuyez pour choisir votre livraison"}
            </span>
          </span>
        </span>

        <span className="flex flex-shrink-0 items-center gap-2">
          {!isOpen && selectedOption && (
            <span className="hidden rounded-full border border-[#A5D6A7] bg-[#E8F5E9] px-3 py-1.5 text-xs font-bold text-[#1B5E20] sm:inline-flex">
              Sélectionnée
            </span>
          )}
          <ChevronDown
            size={21}
            className={`text-[#2E7D32] transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          id="beauty-bio-delivery-options"
          className="space-y-3 p-4 sm:p-5"
        >
          <p className="text-sm font-semibold text-[#4A5E50]">
            Sélectionnez une seule des deux options :
          </p>

          <div
            role="radiogroup"
            aria-label="Choisir un mode de livraison"
            className="space-y-3"
          >
            {options.map((option) => {
              const active = draftMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDraftMode(option.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#A5D6A7] ${
                    active
                      ? "border-[#2E7D32] bg-[#F1F9EE] shadow-md"
                      : "border-[#D3E6CC] bg-white hover:border-[#A5D6A7]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      active
                        ? "border-[#2E7D32] bg-[#2E7D32] text-white"
                        : "border-[#A5BFA8] bg-white text-transparent"
                    }`}
                  >
                    <Check size={14} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base font-bold text-[#14532D]">
                        {option.title}
                      </span>
                      <span className="rounded-full bg-[#DCEFD6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1B5E20]">
                        {option.badge}
                      </span>
                      {active && (
                        <span className="rounded-full bg-[#2E7D32] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          Cochée
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[#4A5E50]">
                      {option.description}
                    </span>
                    <span className="mt-2 block text-xs font-semibold text-[#8A6D0B]">
                      Frais et délais : à confirmer sur WhatsApp
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setDraftMode(selectedMode);
                setIsOpen(false);
              }}
              className="rounded-full border-2 border-[#D3E6CC] bg-white px-5 py-3 text-sm font-bold text-[#14532D] transition hover:bg-[#F5FAF2]"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!draftMode}
              onClick={confirmSelection}
              className="rounded-full border-2 border-[#D4AF37] bg-[#2E7D32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirmer mon choix
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ================================================================
   LECTURE SÉCURISÉE DU PANIER
================================================================ */

function readCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem => {
      return (
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
      );
    });
  } catch {
    return [];
  }
}

/* ================================================================
   PAGE PANIER
================================================================ */

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const thanksVideoRef = useRef<HTMLVideoElement>(null);

  // Paiement Wave
  const [waitingPayment, setWaitingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAnswer, setPaymentAnswer] = useState<"none" | "no">("none");
  const [paid, setPaid] = useState(false);

  /* Chargement du panier et reprise éventuelle d'un paiement en attente */
  useEffect(() => {
    const savedCart = readCart();
    setCart(savedCart);

    try {
      if (
        localStorage.getItem(WAVE_PENDING_KEY) === "1" &&
        savedCart.length > 0
      ) {
        setWaitingPayment(true);
        setShowPaymentModal(true);
      }
    } catch {
      // Le panier reste utilisable même si le stockage est indisponible.
    }

    setLoaded(true);
  }, []);

  /* Au retour sur le site après Wave : demander si le paiement est effectué */
  useEffect(() => {
    if (!waitingPayment) return;

    const onReturn = () => {
      if (document.visibilityState === "visible") {
        setShowPaymentModal(true);
      }
    };

    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);

    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [waitingPayment]);

  /* Confirmation "vider le panier" */
  useEffect(() => {
    if (!confirmClear) return;
    const timer = window.setTimeout(() => setConfirmClear(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmClear]);

  /* Vidéo de remerciement après confirmation manuelle du client */
  useEffect(() => {
    if (!paid) return;
    const video = thanksVideoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => undefined);
    });
  }, [paid]);

  /* ---------------- Panier ---------------- */

  const saveCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      saveCart(cart.filter((item) => item.id !== id));
      return;
    }

    saveCart(
      cart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeItem = (id: string) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setConfirmClear(false);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  /* ---------------- Paiement Wave ---------------- */

  const startWavePayment = () => {
    try {
      localStorage.setItem(WAVE_PENDING_KEY, "1");
    } catch {
      // Le lien Wave reste accessible même si le stockage échoue.
    }

    setPaymentAnswer("none");
    setWaitingPayment(true);
  };

  const confirmPaid = () => {
    // Confirmation déclarative du client : aucun contrôle automatique Wave n'est réalisé.
    clearCart();

    try {
      localStorage.removeItem(WAVE_PENDING_KEY);
    } catch {
      // Ignore
    }

    setWaitingPayment(false);
    setShowPaymentModal(false);
    setPaymentAnswer("none");
    setPaid(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmNotPaid = () => {
    setPaymentAnswer("no");
  };

  const closePaymentModal = () => {
    try {
      localStorage.removeItem(WAVE_PENDING_KEY);
    } catch {
      // Ignore
    }

    setWaitingPayment(false);
    setShowPaymentModal(false);
    setPaymentAnswer("none");
  };

  /* ---------------- Vidéo du hero ---------------- */

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  /* ---------------- Calculs ---------------- */

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Les frais de livraison sont confirmés avec la boutique sur WhatsApp.
  const total = subtotal;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const deliveryLabel =
    deliveryMode === "simple"
      ? "Livraison simple"
      : deliveryMode === "groupage"
        ? "Livraison par groupage"
        : "À choisir";

  /* ---------------- WhatsApp ---------------- */

  const whatsappMessage = [
    "Bonjour Beauté Bio by Gnilane,",
    "",
    "Je souhaite commander les produits suivants :",
    "",
    ...cart.map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ${(item.price * item.quantity).toLocaleString("fr-FR")} FCFA`
    ),
    "",
    `Total des produits : ${subtotal.toLocaleString("fr-FR")} FCFA`,
    deliveryMode
      ? `Mode de livraison choisi : ${deliveryLabel}.`
      : "Mode de livraison : à choisir.",
    "Frais et délai de livraison : à confirmer.",
    "",
    "Merci de me confirmer les modalités de commande.",
  ].join("\n");

  const whatsappLink = `https://wa.me/221783674719?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5FAF2] text-[#12261A]">
      <style jsx global>{`
        @keyframes bb-fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bb-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes bb-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,.4); } 50% { box-shadow: 0 0 0 12px rgba(212,175,55,0); } }
        @keyframes bb-twinkle { 0%, 100% { opacity: .15; transform: scale(.6) rotate(0deg); } 50% { opacity: 1; transform: scale(1.1) rotate(45deg); } }
        @keyframes bb-fall { 0% { transform: translate3d(0,-10vh,0) rotate(0deg); opacity: 0; } 10% { opacity: .8; } 50% { transform: translate3d(30px,45vh,0) rotate(180deg); } 100% { transform: translate3d(-20px,110vh,0) rotate(360deg); opacity: 0; } }
        @keyframes bb-spin { to { transform: rotate(360deg); } }
        @keyframes bb-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes bb-gradient-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes bb-sweep { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(260%) skewX(-20deg); } }
        @keyframes bb-ring-pop { 0% { transform: scale(.9); opacity: .7; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes bb-pop { 0% { transform: scale(1); } 40% { transform: scale(1.3); } 100% { transform: scale(1); } }
        @keyframes bb-item-in { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bb-modal-in { from { opacity: 0; transform: translateY(20px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .bb-fade-up { animation: bb-fade-up .85s ease-out both; }
        .bb-delay-1 { animation-delay: .15s; }
        .bb-delay-2 { animation-delay: .3s; }
        .bb-float { animation: bb-float 5s ease-in-out infinite; }
        .bb-pulse { animation: bb-pulse 2.5s infinite; }
        .bb-twinkle { animation: bb-twinkle 3.6s ease-in-out infinite; }
        .bb-petal { animation: bb-fall linear infinite; will-change: transform; }
        .bb-spin-slow { animation: bb-spin 28s linear infinite; }
        .bb-ring-pop { animation: bb-ring-pop 2.4s ease-out infinite; }
        .bb-pop { animation: bb-pop .35s ease; }
        .bb-item-in { animation: bb-item-in .5s ease-out both; }
        .bb-modal-in { animation: bb-modal-in .4s ease-out both; }
        .bb-gold-text { background-image: linear-gradient(100deg,#f5d76e 0%,#fff3c4 30%,#d4af37 55%,#fff3c4 80%,#f5d76e 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: bb-shimmer 6s linear infinite; }
        .bb-gradient-flow { background: linear-gradient(135deg,#14532d,#2e7d32,#0b2e13,#2e7d32); background-size: 300% 300%; animation: bb-gradient-flow 10s ease infinite; }
        .bb-shine { position: relative; overflow: hidden; }
        .bb-shine::after { content: ""; position: absolute; top: 0; left: 0; height: 100%; width: 40%; background: linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent); transform: translateX(-120%) skewX(-20deg); pointer-events: none; }
        .bb-shine:hover::after { animation: bb-sweep .9s ease; }
        .bb-reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s ease, transform .8s ease; }
        .bb-reveal.bb-in { opacity: 1; transform: translateY(0); }
        html { scroll-behavior: smooth; }

        @media (prefers-reduced-motion: reduce) {
          .bb-fade-up,.bb-float,.bb-pulse,.bb-twinkle,.bb-petal,.bb-spin-slow,.bb-gold-text,.bb-gradient-flow,.bb-ring-pop,.bb-pop,.bb-item-in,.bb-modal-in { animation: none !important; }
          .bb-reveal { opacity: 1; transform: none; transition: none; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#D3E6CC] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <span className="bb-ring-pop absolute inset-0 rounded-full border border-[#D4AF37]" />
              <img
  src="/logo.jpg"
  alt="Logo Beauté Bio by Gnilane"
  className="h-12 w-12 rounded-full border-2 border-[#D4AF37] bg-white object-contain p-0.5 shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-105"
/>
            </div>
            <div>
              <p className="font-serif text-xl font-bold tracking-tight text-[#14532D]">Beauté Bio</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#2E7D32]">By Gnilane</p>
            </div>
          </Link>

          <Link
            href="/produits"
            className="bb-shine inline-flex items-center gap-2 rounded-full border-2 border-[#2E7D32] px-4 py-2.5 text-sm font-semibold text-[#2E7D32] transition duration-300 hover:bg-[#2E7D32] hover:text-white sm:px-5"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Continuer mes achats</span>
            <span className="sm:hidden">Achats</span>
          </Link>
        </div>
      </header>

      {/* HERO AVEC VIDÉO */}
      <section className="relative isolate overflow-hidden bg-[#0B2E13]">
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
            <source src={VIDEO_MP4} type="video/mp4" />
          </video>
        ) : (
          <div className="bb-gradient-flow absolute inset-0 -z-20" />
        )}

        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0B2E13]/85 via-[#14532D]/70 to-[#0B2E13]/90" />
        <div className="bb-spin-slow pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-dashed border-[#F5D76E]/40" />
        <div className="bb-float pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#4CAF50]/25 blur-3xl" />
        <Leaves />
        <Sparkles color="#F5D76E" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 text-center sm:px-8 sm:pb-20 sm:pt-16">
          <div className="bb-fade-up inline-flex items-center gap-3 rounded-full border border-[#F5D76E]/70 bg-[#0B2E13]/70 px-5 py-2 backdrop-blur">
            <Leaf size={14} className="text-[#F5D76E]" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#F5D76E]">Votre expérience Beauté Bio</span>
          </div>

          <h1 className="bb-fade-up bb-delay-1 mt-6 font-serif text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl">
            Mon <span className="bb-gold-text">panier</span>
          </h1>

          <p className="bb-fade-up bb-delay-2 mx-auto mt-4 max-w-lg text-base leading-8 text-[#E3F4DE]">
            Vérifiez votre sélection, choisissez votre mode de livraison et finalisez votre commande.
          </p>

          {cart.length > 0 && (
            <div className="bb-fade-up bb-delay-2 mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5D76E]/70 bg-[#0B2E13]/70 text-white backdrop-blur transition hover:bg-[#2E7D32]"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5D76E]/70 bg-[#0B2E13]/70 text-white backdrop-blur transition hover:bg-[#2E7D32]"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}

        <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full text-[#F5FAF2] sm:h-14">
          <path fill="currentColor" d="M0,30 C240,70 480,0 720,28 C960,56 1200,6 1440,34 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* CONTENU */}
      <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="bb-float pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#A5D6A7]/30 blur-3xl" />
        <Sparkles />

        {!loaded ? (
          <div className="relative flex justify-center py-24" role="status">
            <div className="flex items-center gap-3 text-sm font-semibold text-[#14532D]">
              <span className="bb-spin-slow inline-block h-6 w-6 rounded-full border-2 border-[#D4AF37] border-t-transparent" />
              Chargement de votre panier...
            </div>
          </div>
        ) : paid ? (
          /* APRÈS CONFIRMATION DU CLIENT */
          <div className="relative space-y-8">
            <div className="relative overflow-hidden rounded-3xl border border-[#D3E6CC] bg-white px-5 py-10 text-center shadow-lg sm:px-8">
              <Sparkles />
              <div className="bb-float relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#DCEFD6]">
                <CheckCircle2 size={38} className="text-[#2E7D32]" />
              </div>
              <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#2E7D32]">Confirmation déclarée</p>
              <h2 className="relative mt-3 font-serif text-3xl font-bold text-[#14532D]">Merci pour votre commande !</h2>
              <p className="relative mx-auto mt-4 max-w-sm text-base leading-7 text-[#4A5E50]">
                Merci pour votre confiance. Votre panier a été vidé. La confirmation du paiement doit être vérifiée par la boutique.
              </p>

              <div className="relative mx-auto mt-8 overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-[#0B2E13] shadow-xl">
                <video
                  ref={thanksVideoRef}
                  src={THANKS_VIDEO}
                  className="mx-auto max-h-[70vh] w-full object-contain"
                  autoPlay
                  controls
                  playsInline
                  preload="auto"
                />
              </div>

              <Link href="/produits" className="bb-shine relative mt-8 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#2E7D32] px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#14532D]">
                Continuer mes achats
                <ArrowRight size={18} className="text-[#F5D76E]" />
              </Link>
            </div>

            <Reveal>
              <DeliverySection selectedMode={deliveryMode} onSelect={setDeliveryMode} />
            </Reveal>
          </div>
        ) : cart.length === 0 ? (
          /* PANIER VIDE */
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-[#D3E6CC] bg-white px-6 py-16 text-center shadow-lg">
            <div className="bb-spin-slow absolute -right-16 -top-16 h-44 w-44 rounded-full border border-dashed border-[#D4AF37]/40" />
            <Sparkles />
            <div className="bb-float relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#DCEFD6]">
              <ShoppingBag size={34} className="text-[#2E7D32]" />
            </div>
            <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#2E7D32]">Beauté Bio by Gnilane</p>
            <h2 className="relative mt-3 font-serif text-3xl font-bold text-[#14532D]">Votre panier est vide</h2>
            <p className="relative mx-auto mt-4 max-w-sm text-base leading-7 text-[#4A5E50]">
              Votre prochaine découverte beauté vous attend. Parcourez notre collection et ajoutez vos produits préférés.
            </p>
            <Link href="/produits" className="bb-shine relative mt-8 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#2E7D32] px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#14532D]">
              Découvrir nos produits
              <ArrowRight size={18} className="text-[#F5D76E]" />
            </Link>
          </div>
        ) : (
          /* PANIER NON VIDE : PRODUITS, LIVRAISON, PAIEMENT */
          <div className="relative space-y-10">
            {/* ÉTAPE 1 : PRODUITS */}
            <section className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <StepHeader
                  number={1}
                  label="Ma sélection"
                  title="Vos produits"
                  subtitle={`${cart.length} référence${cart.length > 1 ? "s" : ""} dans votre panier`}
                />
                <button
                  type="button"
                  onClick={() => (confirmClear ? clearCart() : setConfirmClear(true))}
                  className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2.5 text-xs font-bold transition sm:text-sm ${
                    confirmClear
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-[#D3E6CC] bg-white text-[#3F6B4A] hover:border-red-400 hover:text-red-600"
                  }`}
                >
                  <Trash2 size={15} />
                  {confirmClear ? "Confirmer ?" : "Vider"}
                </button>
              </div>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <article
                    key={item.id}
                    className="bb-item-in group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#D3E6CC] bg-white p-3.5 shadow-sm transition duration-300 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#2E7D32]/10 sm:gap-5 sm:p-4"
                    style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
                  >
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-[#D3E6CC] bg-[#DCEFD6] sm:h-28 sm:w-24">
                      {item.image ? (
                        <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">🌿</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2E7D32]">Beauté Bio by Gnilane</p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-base font-bold leading-6 text-[#12261A] sm:text-lg">{item.name}</h3>
                      <p className="mt-1 text-sm text-[#4A5E50]">{item.price.toLocaleString("fr-FR")} FCFA / unité</p>

                      <div className="mt-3 flex items-center">
                        <div className="flex items-center rounded-full border-2 border-[#D3E6CC] bg-[#F1F9EE] p-1">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Diminuer la quantité de ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#14532D] transition hover:bg-[#2E7D32] hover:text-white">
                            <Minus size={15} />
                          </button>
                          <span key={item.quantity} className="bb-pop min-w-9 text-center text-base font-bold text-[#12261A]">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Augmenter la quantité de ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#14532D] transition hover:bg-[#2E7D32] hover:text-white">
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-end justify-between gap-6 self-stretch">
                      <button type="button" onClick={() => removeItem(item.id)} aria-label={`Supprimer ${item.name}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D3E6CC] text-[#3F6B4A] transition hover:border-red-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={17} />
                      </button>
                      <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4A5E50]">Total</p>
                        <p className="mt-0.5 font-serif text-lg font-bold text-[#B8860B] sm:text-xl">
                          {(item.price * item.quantity).toLocaleString("fr-FR")}
                          <span className="ml-1 text-xs font-bold">FCFA</span>
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Link href="/produits" className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#14532D] transition hover:text-[#2E7D32]">
                <ArrowLeft size={16} className="transition group-hover:-translate-x-1" />
                Ajouter d&apos;autres produits
              </Link>
            </section>

            {/* ÉTAPE 2 : LIVRAISON */}
            <Reveal>
              <section>
                <StepHeader
                  number={2}
                  label="Acheminement"
                  title="Mode de livraison"
                  subtitle="Choisissez entre livraison simple et groupage"
                />
                <DeliverySection selectedMode={deliveryMode} onSelect={setDeliveryMode} />
              </section>
            </Reveal>

            {/* ÉTAPE 3 : PAIEMENT */}
            <Reveal>
              <section>
                <StepHeader
                  number={3}
                  label="Règlement"
                  title="Paiement et commande"
                  subtitle="Vérifiez le récapitulatif avant de payer"
                />

                <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-white shadow-xl shadow-[#2E7D32]/10">
                  <div className="bb-gradient-flow relative overflow-hidden px-6 py-5">
                    <div className="bb-spin-slow absolute -right-10 -top-10 h-32 w-32 rounded-full border border-dashed border-[#F5D76E]/50" />
                    <Sparkles color="#F5D76E" />
                    <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-[#F5D76E]">Beauté Bio by Gnilane</p>
                    <h3 className="relative mt-1 flex items-center gap-2 font-serif text-2xl font-bold text-white">
                      <CreditCard size={22} className="text-[#F5D76E]" />
                      Votre commande
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-[#3E4F43]">
                        <Package size={17} className="text-[#2E7D32]" />
                        Articles ({itemCount})
                      </span>
                      <span className="text-sm font-bold">{subtotal.toLocaleString("fr-FR")} FCFA</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-[#3E4F43]">
                        <Truck size={17} className="text-[#2E7D32]" />
                        Livraison
                      </span>
                      <span className="text-right text-sm font-bold text-[#1B5E20]">{deliveryLabel}</span>
                    </div>

                    <div className="mt-5 border-t-2 border-dashed border-[#D3E6CC] pt-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-bold">Total des produits</span>
                        <span key={total} className="bb-pop font-serif text-2xl font-bold text-[#B8860B]">
                          {total.toLocaleString("fr-FR")} <span className="text-sm">FCFA</span>
                        </span>
                      </div>
                      <p className="mt-4 rounded-xl border border-[#A5D6A7] bg-[#E8F5E9] p-3 text-xs leading-5 text-[#1B5E20]">
                        Les frais et délais de livraison (simple ou par groupage) seront confirmés avec vous sur WhatsApp. Ils ne sont pas inclus dans le total affiché.
                      </p>
                    </div>

                    {/* WHATSAPP : toujours visible, même sans mode de livraison choisi */}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bb-shine bb-pulse mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#D4AF37] bg-[#2E7D32] px-4 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#14532D]"
                    >
                      <span className="flex flex-col items-center leading-tight">
                        <span>Commander sur WhatsApp</span>
                        <span className="mt-1 text-xs font-semibold text-[#E3F4DE]">+221 78 367 47 19</span>
                      </span>
                      <ArrowRight size={17} className="text-[#F5D76E]" />
                    </a>

                    {/* WAVE */}
                    <a
                      href={WAVE_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={startWavePayment}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#1D9BF0] bg-[#1D9BF0] px-4 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1479C9]"
                    >
                      Payer avec Wave
                      <ArrowRight size={17} />
                    </a>

                    <div className="mt-5 rounded-xl border border-[#D3E6CC] bg-[#F5FAF2] p-4">
                      <div className="flex items-center justify-center gap-2 text-[#14532D]">
                        <ShieldCheck size={19} className="text-[#D4AF37]" />
                        <p className="text-xs font-bold uppercase tracking-[0.15em]">Commande sécurisée</p>
                      </div>
                      <p className="mt-2 text-center text-xs leading-5 text-[#4A5E50]">
                        Votre commande sera transmise à Gnilane pour confirmation. Votre mode de livraison préféré sera indiqué dans le message WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>
          </div>
        )}
      </div>

      {/* MODALE DE RETOUR WAVE */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0B2E13]/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-title"
        >
          <div className="bb-modal-in relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#D4AF37] bg-white p-7 text-center shadow-2xl">
            <Sparkles />

            {paymentAnswer === "none" ? (
              <>
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#DCEFD6]">
                  <Leaf size={28} className="text-[#2E7D32]" />
                </div>
                <h2 id="payment-title" className="relative mt-5 font-serif text-2xl font-bold text-[#14532D]">
                  Avez-vous effectué le paiement ?
                </h2>
                <p className="relative mt-2 text-sm leading-6 text-[#4A5E50]">
                  Après votre retour depuis Wave, indiquez si vous avez effectué le paiement. Cette réponse n'est pas une vérification automatique de transaction.
                </p>
                <div className="relative mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={confirmPaid}
                    className="rounded-full border-2 border-[#D4AF37] bg-[#2E7D32] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#14532D]"
                  >
                    Oui, j&apos;ai payé
                  </button>
                  <button
                    type="button"
                    onClick={confirmNotPaid}
                    className="rounded-full border-2 border-[#D3E6CC] bg-white px-4 py-3.5 text-sm font-bold text-[#14532D] transition hover:border-[#2E7D32]"
                  >
                    Non
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#FFF8E1]">
                  <XCircle size={30} className="text-[#B8860B]" />
                </div>
                <h2 id="payment-title" className="relative mt-5 font-serif text-2xl font-bold text-[#14532D]">
                  Paiement non effectué
                </h2>
                <p className="relative mt-2 text-sm leading-6 text-[#4A5E50]">
                  Votre panier est conservé. Vous pouvez retourner sur Wave ou revenir à votre panier.
                </p>
                <div className="relative mt-6 space-y-3">
                  <a
                    href={WAVE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={startWavePayment}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#1D9BF0] bg-[#1D9BF0] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#1479C9]"
                  >
                    Payer avec Wave <ArrowRight size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={closePaymentModal}
                    className="w-full rounded-full border-2 border-[#D3E6CC] bg-white px-4 py-3 text-sm font-bold text-[#14532D] transition hover:border-[#2E7D32]"
                  >
                    Revenir à mon panier
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-[#0B2E13] px-5 py-10 text-center">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        <Sparkles color="#F5D76E" />
       <img
  src="/logo.jpg"
  alt="Logo Beauté Bio by Gnilane"
  className="h-12 w-12 rounded-full border-2 border-[#D4AF37] bg-white object-contain p-0.5 shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-105"
/>
        <p className="relative mt-3 font-serif text-xl font-bold text-white">Beauté Bio by Gnilane</p>
        <p className="relative mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F5D76E]">Beauté · Soin · Nature</p>
        <p className="relative mt-5 text-xs text-[#BFDDB8]">
          © {new Date().getFullYear()} Beauté Bio by Gnilane. Tous droits réservés.
        </p>
      </footer>
    </main>
  );
}
