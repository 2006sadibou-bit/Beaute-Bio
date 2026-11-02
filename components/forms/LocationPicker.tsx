"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapPin,
  Loader2,
  Navigation,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  SHOP_LOCATION,
  calculateDeliveryPrice,
} from "@/lib/delivery";

interface Location {
  latitude: number;
  longitude: number;
}

interface DeliveryInfo {
  distance: number;
  duration: number;
  price: number | null;
}

interface LocationPickerProps {
  onDeliveryCalculated: (delivery: DeliveryInfo | null) => void;
}

export default function LocationPicker({
  onDeliveryCalculated,
}: LocationPickerProps) {
  const callbackRef = useRef(onDeliveryCalculated);

  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Garder la dernière version du callback du panier.
  useEffect(() => {
    callbackRef.current = onDeliveryCalculated;
  }, [onDeliveryCalculated]);

  // --------------------------------------------------
  // CALCUL DE DISTANCE ET FRAIS DE LIVRAISON
  // --------------------------------------------------

  const calculateDistance = useCallback(
    async (customerLocation: Location) => {
      setLoading(true);
      setError("");

      setDistance(null);
      setDuration(null);
      setPrice(null);

      callbackRef.current(null);

      try {
        const response = await fetch("/api/checkout/distance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin: SHOP_LOCATION,
            destination: customerLocation,
          }),
        });

        const data: {
          distanceKm?: number;
          durationMinutes?: number;
          error?: string;
        } = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Impossible de calculer la distance."
          );
        }

        const distanceKm = Number(data.distanceKm);
        const durationMinutes = Number(data.durationMinutes);

        if (
          !Number.isFinite(distanceKm) ||
          !Number.isFinite(durationMinutes)
        ) {
          throw new Error(
            "Les données de distance reçues sont invalides."
          );
        }

        const deliveryPrice = calculateDeliveryPrice(distanceKm);

        setDistance(distanceKm);
        setDuration(durationMinutes);
        setPrice(deliveryPrice);

        callbackRef.current({
          distance: distanceKm,
          duration: durationMinutes,
          price: deliveryPrice,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue pendant le calcul."
        );

        callbackRef.current(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --------------------------------------------------
  // GÉOLOCALISATION GPS
  // --------------------------------------------------

  function getLocation(): void {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "La géolocalisation n'est pas disponible sur cet appareil."
      );
      return;
    }

    if (
      SHOP_LOCATION.latitude === 0 &&
      SHOP_LOCATION.longitude === 0
    ) {
      setError(
        "Les coordonnées GPS de la boutique ne sont pas configurées."
      );
      return;
    }

    setLoading(true);

    setDistance(null);
    setDuration(null);
    setPrice(null);

    callbackRef.current(null);

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const customerLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        calculateDistance(customerLocation);
      },

      (geoError: GeolocationPositionError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Vous devez autoriser la géolocalisation dans votre navigateur."
          );
        } else if (geoError.code === geoError.TIMEOUT) {
          setError(
            "Le délai de localisation est dépassé. Veuillez réessayer."
          );
        } else {
          setError(
            "Impossible de récupérer votre position actuelle."
          );
        }

        callbackRef.current(null);
        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  const hasResult = distance !== null;

  return (
    <section className="relative w-full overflow-hidden rounded-[24px] border border-[#F0D3DF] bg-white shadow-sm">
      <style jsx global>{`
        @keyframes sn-lp-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sn-lp-ring {
          0% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }

        @keyframes sn-lp-pop-in {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sn-lp-twinkle {
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

        @keyframes sn-lp-drive {
          0% {
            transform: translateX(-10%);
          }
          100% {
            transform: translateX(110%);
          }
        }

        @keyframes sn-lp-sweep {
          from {
            transform: translateX(-120%) skewX(-20deg);
          }
          to {
            transform: translateX(260%) skewX(-20deg);
          }
        }

        @keyframes sn-lp-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-6px);
          }
          75% {
            transform: translateX(6px);
          }
        }

        .sn-lp-spin-slow {
          animation: sn-lp-spin 24s linear infinite;
        }

        .sn-lp-ring {
          animation: sn-lp-ring 2.2s ease-out infinite;
        }

        .sn-lp-pop-in {
          animation: sn-lp-pop-in 0.5s ease-out both;
        }

        .sn-lp-twinkle {
          animation: sn-lp-twinkle 3.2s ease-in-out infinite;
        }

        .sn-lp-drive {
          animation: sn-lp-drive 2.2s linear infinite;
        }

        .sn-lp-shake {
          animation: sn-lp-shake 0.4s ease;
        }

        .sn-lp-shine {
          position: relative;
          overflow: hidden;
        }

        .sn-lp-shine::after {
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

        .sn-lp-shine:hover:not(:disabled)::after {
          animation: sn-lp-sweep 0.9s ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .sn-lp-spin-slow,
          .sn-lp-ring,
          .sn-lp-pop-in,
          .sn-lp-twinkle,
          .sn-lp-drive,
          .sn-lp-shake {
            animation: none !important;
          }
        }
      `}</style>

      {/* DÉCORATIONS */}
      <div
        aria-hidden="true"
        className="sn-lp-spin-slow pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full border border-dashed border-[#D4AF37]/40"
      />

      <span
        aria-hidden="true"
        className="sn-lp-twinkle pointer-events-none absolute right-6 top-20 h-3 w-3 text-[#D4AF37]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <path d="M12 0 14.6 9.4 24 12 14.6 14.6 12 24 9.4 14.6 0 12 9.4 9.4Z" />
        </svg>
      </span>

      {/* EN-TÊTE */}

      <div className="relative flex items-center gap-4 border-b border-[#F5E3EB] bg-gradient-to-r from-[#FFF5F9] to-white px-4 py-4 sm:px-5">
        <div className="relative shrink-0">
          <span className="sn-lp-ring absolute inset-0 rounded-full border border-[#D4AF37]" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] text-white shadow-md">
            <Truck size={23} strokeWidth={1.8} />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C2185B]">
            Service Sope Naby
          </p>

          <h2 className="font-serif text-xl font-bold text-[#880E4F]">
            Livraison à domicile
          </h2>

          <p className="text-sm text-[#67566A]">
            Calculez vos frais de livraison.
          </p>
        </div>
      </div>

      <div className="relative space-y-5 p-4 sm:p-5">
        {/* LOCALISATION GPS */}

        <div>
          <button
            type="button"
            onClick={getLocation}
            disabled={loading}
            aria-busy={loading}
            className="sn-lp-shine group flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#C2185B]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#880E4F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5D76E] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : hasResult ? (
              <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180" />
            ) : (
              <Navigation className="h-5 w-5 transition-transform group-hover:scale-110" />
            )}

            <span>
              {loading
                ? "Calcul de votre livraison..."
                : hasResult
                ? "Recalculer ma position"
                : "Me localiser"}
            </span>
          </button>

          {/* animation de trajet pendant le calcul */}
          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 overflow-hidden rounded-xl border border-[#F0D3DF] bg-[#FFF5F9] px-4 py-3"
            >
              <div className="relative h-6">
                <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-[#D4AF37]/70" />
                <span className="sn-lp-drive absolute top-0 text-[#C2185B]">
                  <Truck size={20} />
                </span>
              </div>

              <p className="mt-2 text-center text-xs font-semibold text-[#880E4F]">
                Recherche de votre position et du meilleur trajet...
              </p>
            </div>
          )}

          {!loading && (
            <p className="mt-3 text-center text-xs leading-5 text-[#67566A]">
              Autorisez votre GPS pour récupérer automatiquement votre
              position.
            </p>
          )}
        </div>

        {/* RÉSULTAT DE LIVRAISON */}

        {distance !== null && (
          <div
            role="status"
            className="sn-lp-pop-in overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#FFF8E1] to-white shadow-md"
          >
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/40 bg-[#FFF3C4]/60 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32] text-white">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <p className="text-base font-bold text-[#2B1A2B]">
                  Localisation calculée
                </p>

                <p className="text-xs text-[#67566A]">
                  Informations de votre livraison.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-4">
              {/* DISTANCE */}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCE4EC] text-[#C2185B]">
                    <MapPin size={16} />
                  </span>

                  <span className="text-sm text-[#514454]">
                    Distance routière
                  </span>
                </div>

                <span className="text-base font-bold text-[#2B1A2B]">
                  {distance.toFixed(1)} km
                </span>
              </div>

              {/* DURÉE */}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCE4EC] text-[#C2185B]">
                    <Clock size={16} />
                  </span>

                  <span className="text-sm text-[#514454]">
                    Temps estimé
                  </span>
                </div>

                <span className="text-base font-bold text-[#2B1A2B]">
                  {Math.ceil(duration ?? 0)} minutes
                </span>
              </div>

              {/* FRAIS */}

              <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-[#D4AF37]/50 pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C2185B] text-white">
                    <Truck size={16} />
                  </span>

                  <span className="text-sm font-bold text-[#2B1A2B]">
                    Frais de livraison
                  </span>
                </div>

                {price !== null ? (
                  <span className="font-serif text-2xl font-bold text-[#B8860B]">
                    {price.toLocaleString("fr-FR")}{" "}
                    <span className="text-sm">FCFA</span>
                  </span>
                ) : (
                  <span className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                    Sur devis
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ERREUR */}

        {error && (
          <div
            key={error}
            role="alert"
            className="sn-lp-shake flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4"
          >
            <AlertCircle
              size={22}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold leading-6 text-red-800">
                {error}
              </p>

              <button
                type="button"
                onClick={getLocation}
                disabled={loading}
                className="mt-2 text-xs font-bold text-[#C2185B] underline underline-offset-2 transition hover:text-[#880E4F] disabled:opacity-50"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}