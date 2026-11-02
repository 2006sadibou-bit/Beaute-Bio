"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { previewProducts } from "@/lib/products-preview";

type DailyGroup = {
  name: string;
  products: (typeof previewProducts)[number][];
};

function getDailyGroups(): DailyGroup[] {
  const thiourayes = previewProducts.filter((product) => {
    const text = `${product.name} ${product.details ?? ""}`.toLowerCase();

    return (
      text.includes("thiouraye") ||
      text.includes("bukhoor") ||
      text.includes("oute") ||
      text.includes("andeu thiouraye")
    );
  });

  const diw = previewProducts.filter((product) => {
    const text = `${product.name} ${product.details ?? ""}`.toLowerCase();

    return text.includes("diw") || text.includes("whitesecret");
  });

  const accessoires = previewProducts.filter((product) => {
    const text = `${product.name} ${product.details ?? ""}`.toLowerCase();

    return (
      text.includes("accessoire") ||
      text.includes("encensoir") ||
      text.includes("bruleur") ||
      text.includes("brûleur") ||
      text.includes("diffuseur") ||
      text.includes("porte-encens") ||
      text.includes("porte encens")
    );
  });

  return [
    { name: "Thiouraye", products: thiourayes },
    { name: "Diw", products: diw },
    { name: "Accessoires", products: accessoires },
  ].filter((group) => group.products.length > 0);
}

export default function HomePage() {
  const popularProducts = previewProducts.slice(0, 4);

  const [dailySlide, setDailySlide] = useState<{
    category: string;
    product: (typeof previewProducts)[number];
    position: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const dailyGroups = getDailyGroups();

    if (dailyGroups.length === 0) {
      return;
    }

    let groupIndex = 0;
    let slideIndex = 0;

    const updateSlide = () => {
      const currentGroup = dailyGroups[groupIndex];
      const currentProduct = currentGroup.products[slideIndex];

      setDailySlide({
        category: currentGroup.name,
        product: currentProduct,
        position: slideIndex + 1,
        total: currentGroup.products.length,
      });
    };

    updateSlide();

    const interval = window.setInterval(() => {
      const currentGroup = dailyGroups[groupIndex];

      if (slideIndex + 1 < currentGroup.products.length) {
        slideIndex++;
      } else {
        slideIndex = 0;
        groupIndex = (groupIndex + 1) % dailyGroups.length;
      }

      updateSlide();
    }, 6000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#352333]">
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
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        @keyframes sn-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.35);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(212, 175, 55, 0);
          }
        }

        @keyframes sn-product-slide {
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

        @keyframes sn-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
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

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          .sn-fade-up,
          .sn-float,
          .sn-pulse {
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
        Bienvenue chez Sope Naby · Mbour Tali Carreaux
        <span className="ml-2 text-[#F5D76E]">✦</span>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#F5DCE7] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-lg font-bold text-white shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-105">
              SN
            </div>

            <div>
              <p className="font-serif text-lg font-bold tracking-wide text-[#880E4F] sm:text-xl">
                Sope Naby
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#C2185B]">
                Cosmétiques & beauté
              </p>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link
              href="/"
              className="font-bold text-[#C2185B]"
            >
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
          <div className="sn-fade-up">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/50 bg-white px-4 py-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] sn-pulse" />

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#880E4F]">
                L'élégance au quotidien
              </span>
            </div>

            <h1 className="mt-8 max-w-2xl font-serif text-4xl font-bold leading-[1.2] text-[#880E4F] sm:text-5xl lg:text-6xl">
              Révélez votre

              <span className="block bg-gradient-to-r from-[#C2185B] via-[#E91E63] to-[#D4AF37] bg-clip-text text-transparent">
                beauté naturelle.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-8 text-[#67566A] sm:text-base">
              Découvrez l'univers Sope Naby : parfums, thiouraye, soins et
              produits de beauté soigneusement sélectionnés pour vous
              accompagner au quotidien.
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
                href="https://wa.me/221776811311"
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
                  Sope Naby
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#947C8E]">
                  Votre boutique beauté
                </p>
              </div>

              <div className="h-10 w-px bg-[#D4AF37]" />

              <div>
                <p className="text-sm font-bold text-[#244A87]">Mbour</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#947C8E]">
                  Tali Carreaux
                </p>
              </div>
            </div>
          </div>

          {/* DIAPORAMA HERO */}
          <div className="sn-fade-up sn-delay-2 relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-full bg-[#F48FB1]/40 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#D4AF37] bg-white p-3 shadow-2xl">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#880E4F]">
                {dailySlide ? (
                  <Link
                    href="/produits"
                    className="group relative block h-[390px] overflow-hidden sm:h-[480px]"
                  >
                    <img
                      key={`${dailySlide.category}-${dailySlide.product.id}`}
                      src={dailySlide.product.image}
                      alt={dailySlide.product.name}
                      className="h-full w-full object-cover"
                      style={{
                        animation: "sn-product-slide 6s ease-in-out both",
                      }}
                    />

                    {/* VOILE DÉGRADÉ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#450525]/95 via-[#450525]/10 to-[#450525]/20" />

                    {/* CATÉGORIE */}
                    <span className="absolute left-5 top-5 rounded-full border border-[#F5D76E] bg-[#880E4F]/95 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#F5D76E] shadow-lg">
                      ✦ {dailySlide.category}
                    </span>

                    {/* INFORMATIONS PRODUIT */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#F5D76E]">
                        Découvrez notre collection
                      </p>

                      <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                        {dailySlide.product.name}
                      </h2>

                      <p className="mt-4 font-serif text-2xl font-bold text-[#F5D76E]">
                        {dailySlide.product.price.toLocaleString("fr-FR")}
                        <span className="ml-2 text-sm font-semibold">
                          FCFA
                        </span>
                      </p>

                      {/* PROGRESSION */}
                      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                        <div
                          key={`progress-${dailySlide.category}-${dailySlide.product.id}`}
                          className="h-full rounded-full bg-[#F5D76E]"
                          style={{
                            animation: "sn-progress 6s linear both",
                          }}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-white/80">
                          Produit {dailySlide.position} sur {dailySlide.total}
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
                        Sope Naby
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-widest">
                        Beauté · Senteurs · Bien-être
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
            <span>✦ Parfums</span>
            <span>✦ Thiouraye</span>
            <span>✦ Soins & beauté</span>
            <span>✦ Accessoires</span>
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
                Retrouvez une sélection de produits pour votre bien-être et
                votre quotidien.
              </p>
            </div>

            <Link
              href="/produits"
              className="group inline-flex items-center gap-3 text-sm font-bold text-[#244A87] transition hover:text-[#C2185B]"
            >
              Toute la collection
              <span className="transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {popularProducts.map((product, index) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[1.5rem] border border-[#F3D8E3] bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#C2185B]/10"
                style={{
                  animation: `sn-fade-up 0.7s ease-out ${index * 0.12}s both`,
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
                      <span className="ml-1 text-[9px] font-bold">
                        FCFA
                      </span>
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
              L'expérience Sope Naby
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#880E4F] sm:text-4xl">
              Le plaisir des belles senteurs.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#705B70]">
              Des produits choisis pour embellir vos instants et apporter une
              touche de douceur à votre quotidien.
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

      {/* À PROPOS */}
      <section
        id="apropos"
        className="relative overflow-hidden bg-[#880E4F] px-5 py-20 text-white sm:px-8 sm:py-24"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#F5D76E]/20" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#E91E63]/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#F5D76E]">
              Notre univers
            </p>

            <h2 className="mt-5 font-serif text-3xl font-bold sm:text-4xl">
              Bienvenue chez Sope Naby
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#FCE4EC]">
              Votre boutique à Mbour, Tali Carreaux. Retrouvez une sélection de
              produits pour prendre soin de vous, de votre maison et de votre
              bien-être.
            </p>
          </div>

          {/* CATÉGORIES */}
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              {
                icon: "✦",
                name: "Parfums",
                description: "Des senteurs pour chaque occasion.",
              },
              {
                icon: "❋",
                name: "Thiouraye",
                description: "L'art des belles senteurs.",
              },
              {
                icon: "⌂",
                name: "Parfums de chambre",
                description: "Une maison agréablement parfumée.",
              },
              {
                icon: "◇",
                name: "Savons",
                description: "Des produits pour votre quotidien.",
              },
              {
                icon: "✧",
                name: "Encensoirs électriques",
                description: "Des accessoires pratiques.",
              },
              {
                icon: "♡",
                name: "Autres produits",
                description: "Découvrez toute notre sélection.",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="group rounded-2xl border border-white/20 bg-white/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#F5D76E] hover:bg-white/15 sm:p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#F5D76E]/50 bg-white/10 font-serif text-2xl text-[#F5D76E] transition duration-300 group-hover:bg-[#F5D76E] group-hover:text-[#880E4F]">
                  {item.icon}
                </span>

                <h3 className="mt-5 text-sm font-bold text-white sm:text-base">
                  {item.name}
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#FCE4EC]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5D76E]">
              📍 Mbour — Tali Carreaux
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
            href="https://wa.me/221776811311"
            target="_blank"
            rel="noopener noreferrer"
            className="sn-pulse mt-9 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#C2185B] px-9 py-4 text-sm font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#880E4F]"
          >
            <span className="text-lg text-[#F5D76E]">✆</span>
            WhatsApp · 77 681 13 11
            <span className="text-[#F5D76E]">→</span>
          </a>

          <p className="mt-6 text-xs text-[#244A87]">
            📍 Mbour — Tali Carreaux
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#450525] px-5 py-12 text-[#FCE4EC] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#C2185B] font-serif text-lg font-bold text-white">
                SN
              </div>

              <span className="font-serif text-xl font-bold text-white">
                Sope Naby
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-xs leading-7 text-[#EBCBD9]">
              Votre boutique beauté et senteurs à Mbour. Découvrez notre
              univers et notre sélection de produits.
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
              <p>📍 Mbour — Tali Carreaux</p>

              <p>☎ 77 681 13 11</p>

              <a
                href="https://wa.me/221776811311"
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
            Mbour · Sénégal
          </p>
        </div>
      </footer>
    </main>
  );
}