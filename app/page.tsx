"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { previewProducts } from "@/lib/products-preview";

/**
 * ============================================================
 *  INFOS DE MARQUE : à modifier ici uniquement
 *  (idéalement, déplacez-les dans src/lib/config.ts)
 * ============================================================
 */
const BRAND = {
  name: "Beauté bio by Gnilane",
  initials: "BG",
  tagline: "Beauté naturelle & bien-être",
  // TODO : remplacer par le vrai numéro (format international, sans + ni espaces)
  whatsappNumber: "221783674719",
  // TODO : numéro affiché à l'écran
  phoneDisplay: "78 367 47 19",
  // TODO : ville / zone de livraison
  location: "Sénégal",
};

const WHATSAPP_URL = `https://wa.me/${BRAND.whatsappNumber}`;

type Product = (typeof previewProducts)[number];

const SLIDE_DURATION = 6000;

export default function HomePage() {
  const popularProducts = previewProducts.slice(0, 4);
  const slideProducts = previewProducts.slice(0, 6);

  const [slideIndex, setSlideIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Démarre la vidéo lorsqu'elle entre dans la zone visible et la met en pause lorsqu'on la quitte.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          void video.play().catch(() => {
            // Certains navigateurs peuvent bloquer la lecture automatique.
          });
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.35] }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  useEffect(() => {
    if (slideProducts.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slideProducts.length);
    }, SLIDE_DURATION);

    return () => {
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideProducts.length]);

  const currentSlide: Product | undefined = slideProducts[slideIndex];

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#352333]">
      <style jsx global>{`
        @keyframes bg-fade-up {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bg-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.35);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(212, 175, 55, 0);
          }
        }

        @keyframes bg-product-slide {
          0% {
            opacity: 0;
            transform: scale(1.08);
          }
          15% {
            opacity: 1;
            transform: scale(1.03);
          }
          85% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes bg-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .bg-fade-up {
          animation: bg-fade-up 0.85s ease-out both;
        }

        .bg-delay-2 {
          animation-delay: 0.3s;
        }

        .bg-pulse {
          animation: bg-pulse 2.5s infinite;
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-fade-up,
          .bg-pulse {
            animation: none !important;
          }

          html {
            scroll-behavior: auto;
          }
        }
      `}</style>

      {/* BARRE D'ANNONCE */}
      <div className="bg-[#880E4F] px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white sm:text-xs">
        <span className="mr-2 text-[#F5D76E]">✦</span>
        Bienvenue chez {BRAND.name} · Livraison au {BRAND.location}
        <span className="ml-2 text-[#F5D76E]">✦</span>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCE7] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-lg font-bold text-white shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-105">
              {BRAND.initials}
            </div>

            <div>
              <p className="font-serif text-lg font-bold tracking-wide text-[#880E4F] sm:text-xl">
                {BRAND.name}
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#C2185B]">
                {BRAND.tagline}
              </p>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/" className="font-bold text-[#C2185B]">
              Accueil
            </Link>

            <Link
              href="/produits"
              className="text-[#514454] transition hover:text-[#C2185B]"
            >
              Nos produits
            </Link>

            <Link
              href="#apropos"
              className="text-[#514454] transition hover:text-[#C2185B]"
            >
              À propos
            </Link>

            <Link
              href="#contact"
              className="text-[#514454] transition hover:text-[#C2185B]"
            >
              Contact
            </Link>

            <Link
              href="/panier"
              className="rounded-full border-2 border-[#C2185B] px-6 py-2.5 font-semibold text-[#C2185B] transition duration-300 hover:bg-[#C2185B] hover:text-white"
            >
              Mon panier
            </Link>
          </nav>

          {/* PANIER MOBILE */}
          <Link
            href="/panier"
            className="rounded-full bg-[#C2185B] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#880E4F] md:hidden"
          >
            Panier
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#FFF5F9] via-white to-[#FCE4EC]">
        {/* DÉCORATIONS */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full border border-[#D4AF37]/30" />

        <div className="pointer-events-none absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full border border-[#C2185B]/10" />

        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-[#F8BBD0]/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:px-12 lg:py-28">
          {/* TEXTE */}
          <div className="bg-fade-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/50 bg-white px-4 py-2 shadow-sm">
              <span className="bg-pulse h-2 w-2 rounded-full bg-[#D4AF37]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#880E4F]">
                Le naturel au quotidien
              </span>
            </div>

            <h1 className="mt-8 max-w-2xl font-serif text-4xl font-bold leading-[1.2] text-[#880E4F] sm:text-5xl lg:text-6xl">
              Prenez soin de vous
              <span className="block bg-gradient-to-r from-[#C2185B] via-[#E91E63] to-[#D4AF37] bg-clip-text text-transparent">
                Rayonnez chaque jour.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-8 text-[#67566A] sm:text-base">
              Découvrez l'univers {BRAND.name} : des soins et des produits de
              beauté naturels, soigneusement sélectionnés pour prendre soin de
              vous au quotidien.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/produits"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#C2185B] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#C2185B]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#880E4F] hover:shadow-2xl"
              >
                Découvrir la boutique
                <span className="transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#244A87] px-8 py-4 text-sm font-semibold text-[#244A87] transition duration-300 hover:bg-[#244A87] hover:text-white"
              >
                Nous contacter
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#E9C7D6] pt-7">
              <div>
                <p className="font-serif text-2xl font-bold text-[#C2185B]">
                  {BRAND.name}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#947C8E]">
                  Votre boutique beauté
                </p>
              </div>

              <div className="h-10 w-px bg-[#D4AF37]" />

              <div>
                <p className="text-sm font-bold text-[#244A87]">
                  {BRAND.location}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#947C8E]">
                  Boutique en ligne
                </p>
              </div>
            </div>
          </div>

          {/* DIAPORAMA HERO */}
          <div className="bg-fade-up bg-delay-2 relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-full bg-[#F48FB1]/40 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#D4AF37] bg-white p-3 shadow-2xl">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#880E4F]">
                {currentSlide ? (
                  <Link
                    href="/produits"
                    className="group relative block h-[390px] overflow-hidden sm:h-[480px]"
                  >
                    <img
                      key={`slide-${currentSlide.id}`}
                      src={currentSlide.image}
                      alt={currentSlide.name}
                      className="h-full w-full object-cover"
                      style={{
                        animation: `bg-product-slide ${SLIDE_DURATION}ms ease-in-out both`,
                      }}
                    />

                    {/* VOILE DÉGRADÉ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#450525]/95 via-[#450525]/10 to-[#450525]/20" />

                    {/* LABEL */}
                    <span className="absolute left-5 top-5 rounded-full border border-[#F5D76E] bg-[#880E4F]/95 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#F5D76E] shadow-lg">
                      ✦ Sélection
                    </span>

                    {/* INFORMATIONS PRODUIT */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F5D76E]">
                        Découvrez notre collection
                      </p>

                      <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                        {currentSlide.name}
                      </h2>

                      <p className="mt-4 font-serif text-2xl font-bold text-[#F5D76E]">
                        {currentSlide.price.toLocaleString("fr-FR")}
                        <span className="ml-2 text-sm font-semibold">
                          FCFA
                        </span>
                      </p>

                      {/* PROGRESSION */}
                      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                        <div
                          key={`progress-${currentSlide.id}`}
                          className="h-full rounded-full bg-[#F5D76E]"
                          style={{
                            animation: `bg-progress ${SLIDE_DURATION}ms linear both`,
                          }}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-white/80">
                          Produit {slideIndex + 1} sur {slideProducts.length}
                        </p>

                        <span className="text-sm font-semibold text-[#F5D76E] transition group-hover:translate-x-1">
                          Découvrir →
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex h-[390px] items-center justify-center px-6 text-center text-[#F5D76E] sm:h-[480px]">
                    <div>
                      <p className="font-serif text-3xl font-bold">
                        {BRAND.name}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-widest">
                        Beauté · Naturel · Bien-être
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BAS DU HERO */}
        <div className="relative border-t border-[#E9C7D6] bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-5 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#880E4F] sm:text-xs">
            <span>✦ Soins visage</span>
            <span>✦ Soins corps</span>
            <span>✦ Cheveux</span>
            <span>✦ Produits naturels</span>
          </div>
        </div>
      </section>

      {/* PRODUITS POPULAIRES */}
      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C2185B]">
                Notre sélection
              </p>

              <h2 className="mt-4 font-serif text-3xl font-bold text-[#880E4F] sm:text-4xl">
                Nos produits populaires
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-7 text-[#766779]">
                Retrouvez une sélection de produits naturels pour votre beauté
                et votre bien-être.
              </p>
            </div>

            <Link
              href="/produits"
              className="group inline-flex items-center gap-3 text-sm font-bold text-[#244A87] transition hover:text-[#C2185B]"
            >
              Toute la collection
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {popularProducts.map((product, index) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[1.5rem] border border-[#F3D8E3] bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#C2185B]/10"
                style={{
                  animation: `bg-fade-up 0.7s ease-out ${index * 0.12}s both`,
                }}
              >
                <Link
                  href="/produits"
                  className="relative block aspect-[4/5] overflow-hidden bg-[#FCE4EC]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#880E4F]/25 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                  <span className="absolute left-3 top-3 rounded-full border border-[#D4AF37] bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#880E4F] shadow-sm">
                    Sélection
                  </span>

                  <div className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-[#C2185B] text-lg text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    →
                  </div>
                </Link>

                <div className="p-3.5 sm:p-5">
                  <h3 className="line-clamp-2 min-h-[42px] text-xs font-semibold leading-5 text-[#493344] sm:text-sm">
                    {product.name}
                  </h3>

                  <div className="mt-3 flex flex-col gap-2 border-t border-[#F3E4EA] pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-serif text-base font-bold text-[#C49A18] sm:text-lg">
                      {product.price.toLocaleString("fr-FR")}
                      <span className="ml-1 text-[9px] font-bold">FCFA</span>
                    </p>

                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[#244A87]">
                      Découvrir →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/produits"
              className="inline-flex items-center justify-center gap-4 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-9 py-4 text-sm font-bold text-white shadow-lg shadow-[#C2185B]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#880E4F]"
            >
              Explorer tous les produits
              <span className="text-lg text-[#F5D76E]">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* BANDEAU ÉLÉGANT */}
      <section className="relative overflow-hidden border-y border-[#F0D3DF] bg-[#FCE4EC] px-5 py-14 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#D4AF37]/40" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C2185B]">
              L'expérience {BRAND.name}
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#880E4F] sm:text-4xl">
              Le naturel au service de votre beauté.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#705B70]">
              Des produits choisis avec soin pour sublimer votre peau, vos
              cheveux et votre quotidien.
            </p>
          </div>

          <Link
            href="/produits"
            className="shrink-0 rounded-full border-2 border-[#C2185B] px-8 py-4 text-sm font-bold text-[#C2185B] transition duration-300 hover:bg-[#C2185B] hover:text-white"
          >
            Visiter la boutique →
          </Link>
        </div>
      </section>

      {/* VIDÉO DE PRÉSENTATION */}
      <section
        id="apropos"
        className="relative overflow-hidden bg-[#880E4F] px-5 py-20 text-white sm:px-8 sm:py-24"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#F5D76E]/20" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#E91E63]/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#F5D76E]">
            Notre univers
          </p>

          <h2 className="mt-5 font-serif text-3xl font-bold sm:text-4xl">
            Bienvenue chez {BRAND.name}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#FCE4EC]">
            Découvrez notre univers à travers une expérience vidéo.
            Beauté, élégance et bien-être au quotidien.
          </p>

          <div className="mx-auto mt-12 max-w-[380px] overflow-hidden rounded-[2rem] border-2 border-[#D4AF37] bg-black shadow-2xl">
            <video
              ref={videoRef}
              src="/video32.mp4"
              autoPlay
              muted
              controls
              playsInline
              loop
              preload="metadata"
              className="block aspect-[9/16] w-full object-cover"
            >
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          </div>

          <div className="mt-9">
            <div className="mx-auto mb-5 h-px max-w-xs bg-[#D4AF37]/60" />
            <p className="font-serif text-xl font-bold tracking-wide text-[#F5D76E] sm:text-2xl">
              Beauté · Élégance · Bien-être
            </p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#FCE4EC]">
              Naturel · Bio · Respectueux de la nature
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#D4AF37]/30" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C2185B]">
            Restons en contact
          </p>

          <h2 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#880E4F] sm:text-5xl">
            Une envie ? Une commande ?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-[#766779]">
            Notre équipe est disponible pour vous accompagner dans vos
            commandes et répondre à vos questions.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pulse mt-9 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-9 py-4 text-sm font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#880E4F]"
          >
            <span className="text-lg text-[#F5D76E]">✆</span>
            WhatsApp · {BRAND.phoneDisplay}
            <span className="text-[#F5D76E]">→</span>
          </a>

          <p className="mt-6 text-xs text-[#244A87]">📍 {BRAND.location}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#450525] px-5 py-12 text-[#FCE4EC] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-lg font-bold text-white">
                {BRAND.initials}
              </div>

              <span className="font-serif text-xl font-bold text-white">
                {BRAND.name}
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-xs leading-7 text-[#EBCBD9]">
              Votre boutique de beauté naturelle. Découvrez notre univers et
              notre sélection de produits.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5D76E]">
              Navigation
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm">
              <Link href="/" className="transition hover:text-[#F5D76E]">
                Accueil
              </Link>

              <Link
                href="/produits"
                className="transition hover:text-[#F5D76E]"
              >
                Nos produits
              </Link>

              <Link
                href="/panier"
                className="transition hover:text-[#F5D76E]"
              >
                Mon panier
              </Link>

              <Link
                href="#apropos"
                className="transition hover:text-[#F5D76E]"
              >
                À propos
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5D76E]">
              Nous contacter
            </h3>

            <div className="mt-5 space-y-3 text-sm">
              <p>📍 {BRAND.location}</p>

              <p>☎ {BRAND.phoneDisplay}</p>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[#F5D76E] transition hover:text-white"
              >
                Écrire sur WhatsApp →
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-white/15 pt-7 text-center">
          <p className="text-xs text-[#EBCBD9]">
            © {new Date().getFullYear()} {siteConfig.shopName}. Tous droits
            réservés.
          </p>

          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
            {BRAND.location}
          </p>
        </div>
      </footer>
    </main>
  );
}