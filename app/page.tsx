"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { previewProducts } from "@/lib/products-preview";

const BRAND = {
  name: "Beauté bio by Gnilane",
  initials: "BG",
  tagline: "Beauté naturelle & bien-être",
  whatsappNumber: "221783674719",
  phoneDisplay: "78 367 47 19",
  location: "Sénégal",
};

const WHATSAPP_URL = `https://wa.me/${BRAND.whatsappNumber}`;
const TIKTOK_URL = "https://www.tiktok.com/@savonmbeurbeuf?_r=1&_t=ZS-9B89EgzCIhb";
const INSTAGRAM_URL = "https://www.instagram.com/beautebio_by_gnilane?dlrf=Ymw1eXk4dWF6dGdu";

type Product = (typeof previewProducts)[number];

const SLIDE_DURATION = 6000;
const LOGO_TIKTOK_MS = 15000;
const LOGO_INSTAGRAM_MS = 10000;

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.5 3.5C10 3 4 8.5 4 15.5c0 1.6.4 3 1 4.2C6.4 17 9 13.5 13.5 11c-3.2 3-5.2 6-6.3 9.2 1 .5 2.2.8 3.3.8 7 0 10.5-6 10-17.5Z" />
    </svg>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "article";
}) {
  const ref = useRef<HTMLDivElement & HTMLElement>(null);
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
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`bg-reveal ${visible ? "bg-reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}

const ABOUT_PARAGRAPHS = [
  "Beauté Bio by Gnilane est une boutique dédiée à la beauté, aux soins et au bien-être. Notre univers met à l’honneur des produits inspirés par la nature et des gestes simples pour prendre soin de soi au quotidien.",
  "Vous y trouverez une sélection de savons, de soins du visage, de produits pour le corps et de soins pour les cheveux, avec une place particulière accordée aux produits au Mbeurbeuff. Chaque article est présenté pour vous aider à découvrir ses bienfaits et à choisir selon vos besoins.",
  "Notre souhait est de rendre votre routine skin care agréable avec des tarifs abordables et accessibles à tous. Nous vous offrons un accompagnement pour vos commandes et une livraison organisée selon votre destination.",
];

const ABOUT_WORD_COUNT = ABOUT_PARAGRAPHS.reduce(
  (total, paragraph) => total + paragraph.trim().split(/\s+/).length,
  0
);

const ABOUT_PARAGRAPH_DELAYS = ABOUT_PARAGRAPHS.map((paragraph, index) => {
  const previousWords = ABOUT_PARAGRAPHS.slice(0, index).reduce(
    (total, item) => total + item.trim().split(/\s+/).length,
    0
  );
  return previousWords * 0.09 + index * 0.22;
});

function AnimatedWords({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const words = text.trim().split(/\s+/);

  return (
    <span className={className} aria-label={text}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="about-word"
          style={{
            animationDelay: `${delay + index * 0.09}s`,
            marginRight: index === words.length - 1 ? 0 : "0.3em",
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export default function HomePage() {
  const popularProducts = previewProducts.slice(0, 4);
  const slideProducts = previewProducts.slice(0, 6);

  const [slideIndex, setSlideIndex] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showAboutVideo, setShowAboutVideo] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const aboutContentRef = useRef<HTMLDivElement>(null);

  const handleAboutClick = () => {
    if (!aboutOpen) {
      setAboutOpen(true);
      window.setTimeout(() => {
        aboutContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 140);
    } else {
      setAboutOpen(false);
    }
  };

  const handleAboutClose = () => {
    videoRef.current?.pause();
    setAboutOpen(false);

    window.setTimeout(() => {
      document.getElementById("apropos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  useEffect(() => {
    setShowAboutVideo(false);
    if (!aboutOpen) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const paragraphGaps = Math.max(0, ABOUT_PARAGRAPHS.length - 1) * 220;

    const revealDelay = reducedMotion
      ? 0
      : (ABOUT_WORD_COUNT - 1) * 90 + paragraphGaps + 900;

    const timer = window.setTimeout(
      () => setShowAboutVideo(true),
      revealDelay
    );

    return () => window.clearTimeout(timer);
  }, [aboutOpen]);

  useEffect(() => {
    if (!aboutOpen || !showAboutVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          void video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.25] }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [aboutOpen, showAboutVideo]);

  useEffect(() => {
    if (slideProducts.length <= 1) return;

    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slideProducts.length);
    }, SLIDE_DURATION);

    return () => window.clearInterval(interval);
  }, [slideProducts.length]);

  const [activeLogo, setActiveLogo] = useState<"tiktok" | "instagram">("tiktok");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setActiveLogo((current) => (current === "tiktok" ? "instagram" : "tiktok")),
      activeLogo === "tiktok" ? LOGO_TIKTOK_MS : LOGO_INSTAGRAM_MS
    );
    return () => window.clearTimeout(timer);
  }, [activeLogo]);

  const currentSlide: Product | undefined = slideProducts[slideIndex];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F4FAF5] text-[#1A2E24]">
      <style jsx global>{`
        @keyframes bg-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bg-fade-down {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bg-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(82, 183, 136, 0.45); }
          50% { box-shadow: 0 0 0 12px rgba(82, 183, 136, 0); }
        }

        @keyframes bg-product-slide {
          0% { opacity: 0; transform: scale(1.08); }
          15% { opacity: 1; transform: scale(1.03); }
          85% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }

        @keyframes bg-progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes bg-float {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-14px) rotate(calc(var(--r, 0deg) + 6deg)); }
        }

        @keyframes bg-shimmer-text {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes bg-shine {
          0% { transform: translateX(-130%) skewX(-18deg); }
          100% { transform: translateX(230%) skewX(-18deg); }
        }

        @keyframes bg-frame-glow {
          0%, 100% {
            box-shadow: 0 25px 60px rgba(27, 67, 50, .22), 0 0 0 0 rgba(212, 175, 55, .35);
          }
          50% {
            box-shadow: 0 30px 75px rgba(27, 67, 50, .30), 0 0 0 14px rgba(212, 175, 55, 0);
          }
        }

        @keyframes bg-img-in {
          from { opacity: 0; transform: scale(1.12); filter: blur(10px) saturate(.8); }
          to { opacity: 1; transform: scale(1); filter: blur(0) saturate(1); }
        }

        @keyframes bg-badge-pop {
          0% { opacity: 0; transform: translateY(-8px) scale(.8); }
          70% { transform: translateY(0) scale(1.06); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes about-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes about-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(183, 228, 199, .25), 0 18px 55px rgba(14, 55, 36, .18);
          }
          50% {
            box-shadow: 0 0 0 16px rgba(183, 228, 199, 0), 0 22px 70px rgba(14, 55, 36, .28);
          }
        }

        @keyframes about-word-in {
          from { opacity: 0; transform: translate3d(0, 16px, 0) scale(.98); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes about-heading-in {
          0% { opacity: 0; transform: translateY(30px) scale(.96); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes about-panel-open {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(.94);
            clip-path: inset(0 0 100% 0 round 2rem);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            clip-path: inset(0 0 0 0 round 2rem);
          }
        }

        @keyframes about-video-reveal {
          from { opacity: 0; transform: translate3d(0, 34px, 0) scale(.96); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes about-leaf-float {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-16px) rotate(9deg); }
        }

        @keyframes about-ring {
          0% { transform: scale(.78); opacity: .8; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        @keyframes about-line-grow {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }

        @keyframes about-arrow-top {
          0%, 100% { transform: translate(-50%, 0); opacity: .72; }
          50% { transform: translate(-50%, 8px); opacity: 1; }
        }

        @keyframes about-arrow-bottom {
          0%, 100% { transform: translate(-50%, 0); opacity: .72; }
          50% { transform: translate(-50%, -8px); opacity: 1; }
        }

        @keyframes about-arrow-left {
          0%, 100% { transform: translate(0, -50%); opacity: .72; }
          50% { transform: translate(8px, -50%); opacity: 1; }
        }

        @keyframes about-arrow-right {
          0%, 100% { transform: translate(0, -50%); opacity: .72; }
          50% { transform: translate(-8px, -50%); opacity: 1; }
        }

        .bg-fade-up { animation: bg-fade-up .85s ease-out both; }
        .bg-delay-2 { animation-delay: .3s; }
        .bg-pulse { animation: bg-pulse 2.5s infinite; }
        .bg-header { animation: bg-fade-down .8s cubic-bezier(.2,.75,.25,1) .1s both; }
        .bg-float { animation: bg-float 6s ease-in-out infinite; }

        .bg-gradient-text {
          background-size: 200% auto;
          animation: bg-shimmer-text 6s linear infinite;
        }

        .bg-hero-frame { animation: bg-frame-glow 4s ease-in-out infinite; }
        .bg-badge-pop { animation: bg-badge-pop .7s cubic-bezier(.2,.75,.25,1) .5s both; }

        .bg-reveal {
          opacity: 0;
          transform: translateY(34px) scale(.985);
          transition: opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1);
          will-change: opacity, transform;
        }

        .bg-reveal-in { opacity: 1; transform: translateY(0) scale(1); }

        .bg-nav-link { position: relative; }

        .bg-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 2px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #D4AF37, #F5D76E);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .4s cubic-bezier(.2,.75,.25,1);
        }

        .bg-nav-link:hover::after { transform: scaleX(1); }

        .bg-card {
          position: relative;
          transform-style: preserve-3d;
          transition: transform .6s cubic-bezier(.16,1,.3,1), box-shadow .6s ease, border-color .5s ease;
        }

        .bg-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(212,175,55,0), rgba(212,175,55,.9), rgba(82,183,136,.9), rgba(212,175,55,0));
          background-size: 250% 250%;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity .5s ease;
          pointer-events: none;
        }

        .bg-card:hover { transform: translateY(-8px) rotateX(2deg); }
        .bg-card:hover::before { opacity: 1; animation: bg-shimmer-text 3s linear infinite; }

        .bg-card-media {
          isolation: isolate;
          box-shadow: inset 0 0 0 1px rgba(212,175,55,.35), inset 0 -60px 70px -40px rgba(15,45,32,.35);
        }

        .bg-card-img {
          animation: bg-img-in 1.1s cubic-bezier(.16,1,.3,1) both;
          transition: transform 1.1s cubic-bezier(.16,1,.3,1), filter .8s ease;
          filter: saturate(1.05) contrast(1.03);
        }

        .bg-card:hover .bg-card-img {
          transform: scale(1.12) rotate(.6deg);
          filter: saturate(1.2) contrast(1.06) brightness(1.03);
        }

        .bg-card-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent);
          transform: translateX(-130%) skewX(-18deg);
          pointer-events: none;
        }

        .bg-card:hover .bg-card-shine { animation: bg-shine 1.1s ease-in-out; }
        .bg-card-badge { animation: bg-badge-pop .7s cubic-bezier(.2,.75,.25,1) both; }

        .bg-card-line {
          height: 2px;
          width: 100%;
          border-radius: 9999px;
          background: linear-gradient(90deg, #2D6A4F, #D4AF37);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .6s cubic-bezier(.16,1,.3,1);
        }

        .bg-card:hover .bg-card-line { transform: scaleX(1); }

        .about-cta-glow { animation: about-glow 2.8s ease-in-out infinite; }
        .about-orbit { animation: about-orbit 18s linear infinite; }
        .about-ring { animation: about-ring 3.2s ease-out infinite; }
        .about-ring-2 { animation-delay: 1.6s; }
        .about-leaf-float { animation: about-leaf-float 5s ease-in-out infinite; }

        .about-word {
          display: inline-block;
          white-space: nowrap;
          opacity: 0;
          animation: about-word-in .68s cubic-bezier(.2,.75,.25,1) both;
        }

        .about-heading-reveal {
          opacity: 0;
          animation: about-heading-in .8s cubic-bezier(.2,.75,.25,1) both;
        }

        .about-panel { animation: about-panel-open 1s cubic-bezier(.16,1,.3,1) both; }
        .about-video-reveal { opacity: 0; animation: about-video-reveal .95s cubic-bezier(.16,1,.3,1) both; }
        .about-line { transform-origin: center; animation: about-line-grow .9s cubic-bezier(.16,1,.3,1) .35s both; }

        .about-arrow {
          position: absolute;
          z-index: 20;
          display: flex;
          height: 2.4rem;
          width: 2.4rem;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212,175,55,.85);
          border-radius: 9999px;
          background: #2D6A4F;
          color: #fff;
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1;
          box-shadow: 0 8px 24px rgba(15,45,32,.25);
          pointer-events: none;
        }

        .about-arrow-top { top: 0; left: 50%; animation: about-arrow-top 1.25s ease-in-out infinite; }
        .about-arrow-bottom { bottom: 0; left: 50%; animation: about-arrow-bottom 1.25s ease-in-out infinite; }
        .about-arrow-left { left: .25rem; top: 50%; animation: about-arrow-left 1.25s ease-in-out infinite; }
        .about-arrow-right { right: .25rem; top: 50%; animation: about-arrow-right 1.25s ease-in-out infinite; }

        .about-close {
          position: relative;
          overflow: hidden;
          transition: transform .45s cubic-bezier(.16,1,.3,1), background-color .4s ease, box-shadow .4s ease;
        }

        .about-close::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent);
          transform: translateX(-130%) skewX(-18deg);
          pointer-events: none;
        }

        .about-close:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(27,67,50,.35); }
        .about-close:hover::after { animation: bg-shine 1s ease-in-out; }
        .about-close:active { transform: translateY(0) scale(.97); }
        .about-close-icon { transition: transform .5s cubic-bezier(.16,1,.3,1); }
        .about-close:hover .about-close-icon { transform: rotate(180deg) scale(1.1); }

        @keyframes bg-btn-sweep {
          0% { transform: translateX(-140%) skewX(-18deg); }
          60%, 100% { transform: translateX(260%) skewX(-18deg); }
        }

        @keyframes bg-sparkle-spin {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(20deg) scale(1.25); }
          50% { transform: rotate(0deg) scale(1); }
          75% { transform: rotate(-20deg) scale(1.25); }
          100% { transform: rotate(0deg) scale(1); }
        }

        @keyframes bg-conseil-bg {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes bg-conseil-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,.55), 0 6px 18px rgba(45,106,79,.30); }
          50% { box-shadow: 0 0 0 12px rgba(212,175,55,0), 0 10px 26px rgba(45,106,79,.45); }
        }

        @keyframes bg-conseil-wiggle {
          0%, 88%, 100% { transform: translateY(0) rotate(0); }
          91% { transform: translateY(-3px) rotate(-3deg); }
          94% { transform: translateY(0) rotate(3deg); }
          97% { transform: translateY(-2px) rotate(-2deg); }
        }

        @keyframes bg-spark-pop {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0); }
          50% { opacity: 1; transform: scale(1) rotate(90deg); }
        }

        .bg-btn {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transition: transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s ease, background-color .35s ease, color .35s ease, border-color .35s ease;
        }

        .bg-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          width: 40%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent);
          transform: translateX(-140%) skewX(-18deg);
          pointer-events: none;
        }

        .bg-btn:hover { transform: translateY(-3px) scale(1.02); }
        .bg-btn:hover::after { animation: bg-btn-sweep .9s ease-in-out; }
        .bg-btn:active { transform: translateY(0) scale(.95); }
        .bg-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(82,183,136,.5); }

        .bg-conseil {
          background-image: linear-gradient(90deg, #2D6A4F, #52B788, #D4AF37, #52B788, #2D6A4F);
          background-size: 200% auto;
          color: #fff !important;
          border: 1.5px solid rgba(212,175,55,.8);
          animation: bg-conseil-bg 4s linear infinite, bg-conseil-glow 2.6s ease-in-out infinite, bg-conseil-wiggle 5s ease-in-out infinite;
        }

        .bg-conseil::after { animation: bg-btn-sweep 3.2s ease-in-out infinite; }
        .bg-conseil:hover { transform: translateY(-4px) scale(1.05) rotate(-1deg); }
        .bg-sparkle { animation: bg-sparkle-spin 2.4s ease-in-out infinite; color: #F5D76E; }
        .bg-conseil:hover .bg-sparkle { animation-duration: .8s; }

        .bg-spark-dot {
          position: absolute;
          z-index: 1;
          height: 6px;
          width: 6px;
          border-radius: 9999px;
          background: #F5D76E;
          pointer-events: none;
          animation: bg-spark-pop 2s ease-in-out infinite;
        }

        .bg-arrow { display: inline-block; transition: transform .4s cubic-bezier(.16,1,.3,1); }
        .bg-btn:hover .bg-arrow { transform: translateX(6px); }

        @keyframes tt-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-3deg); }
        }

        @keyframes tt-glow {
          0%, 100% {
            box-shadow: 0 0 8px 1px rgba(37, 244, 238, .4), 0 0 18px 4px rgba(254, 44, 85, .25);
          }
          50% {
            box-shadow: 0 0 14px 4px rgba(37, 244, 238, .65), 0 0 28px 8px rgba(254, 44, 85, .4);
          }
        }

        @keyframes tt-ring {
          0% { transform: scale(1); opacity: .6; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @keyframes tt-shine {
          0% { transform: translateX(-170%) skewX(-18deg); }
          55%, 100% { transform: translateX(270%) skewX(-18deg); }
        }

        @keyframes tt-cyan {
          0%, 100% { transform: translate(-.5px, -.5px); }
          50% { transform: translate(-1px, -.5px); }
        }

        @keyframes tt-pink {
          0%, 100% { transform: translate(.5px, .5px); }
          50% { transform: translate(1px, .5px); }
        }

        @keyframes tt-note {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, .5)); }
          50% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, .8)); }
        }

        @keyframes logo-swap-in {
          from { opacity: 0; transform: scale(.85) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .logo-swap-in { animation: logo-swap-in .6s cubic-bezier(.2,.75,.25,1) both; }

        .tt-logo {
          position: relative;
          display: inline-flex;
          height: 3.5rem;
          width: 3.5rem;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          animation: tt-float 4s ease-in-out infinite;
        }

        .tt-face {
          position: relative;
          z-index: 1;
          display: flex;
          height: 100%;
          width: 100%;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid #D4AF37;
          border-radius: 9999px;
          background: #010101;
          animation: tt-glow 3s ease-in-out infinite;
        }

        .tt-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid rgba(37, 244, 238, .6);
          pointer-events: none;
          animation: tt-ring 3.2s ease-out infinite;
        }

        .tt-ring-2 {
          border-color: rgba(254, 44, 85, .6);
          animation-delay: 1.6s;
        }

        .tt-svg {
          height: 55%;
          width: 55%;
          overflow: visible;
          transition: transform .5s cubic-bezier(.16,1,.3,1);
        }

        .tt-logo:hover .tt-svg { transform: scale(1.12) rotate(6deg); }
        .tt-note-white { animation: tt-note 2.6s ease-in-out infinite; }
        .tt-note-cyan { animation: tt-cyan 2.6s ease-in-out infinite; }
        .tt-note-pink { animation: tt-pink 2.6s ease-in-out infinite; }

        .tt-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.6), transparent);
          transform: translateX(-170%) skewX(-18deg);
          pointer-events: none;
          animation: tt-shine 4.5s ease-in-out infinite;
        }

        .tt-logo:focus-visible { outline: none; }
        .tt-logo:focus-visible .tt-face { box-shadow: 0 0 0 4px rgba(82,183,136,.6); }

        @keyframes ig-glow {
          0%, 100% {
            box-shadow: 0 0 8px 1px rgba(214, 41, 118, .4), 0 0 18px 4px rgba(250, 126, 30, .25);
          }
          50% {
            box-shadow: 0 0 14px 4px rgba(214, 41, 118, .65), 0 0 28px 8px rgba(250, 126, 30, .45);
          }
        }

        @keyframes ig-bg {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes ig-icon {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, .5)); }
          50% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, .8)); }
        }

        .ig-logo {
          position: relative;
          display: inline-flex;
          height: 3.5rem;
          width: 3.5rem;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          animation: tt-float 4s ease-in-out .6s infinite;
        }

        .ig-face {
          position: relative;
          z-index: 1;
          display: flex;
          height: 100%;
          width: 100%;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid #D4AF37;
          border-radius: 1.1rem;
          background-image: linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75);
          background-size: 200% 200%;
          animation: ig-bg 7s linear infinite, ig-glow 3s ease-in-out infinite;
        }

        .ig-ring {
          position: absolute;
          inset: 0;
          border-radius: 1.1rem;
          border: 2px solid rgba(214, 41, 118, .6);
          pointer-events: none;
          animation: tt-ring 3.2s ease-out infinite;
        }

        .ig-ring-2 {
          border-color: rgba(250, 126, 30, .6);
          animation-delay: 1.6s;
        }

        .ig-svg {
          height: 58%;
          width: 58%;
          overflow: visible;
          transition: transform .5s cubic-bezier(.16,1,.3,1);
          animation: ig-icon 2.6s ease-in-out infinite;
        }

        .ig-logo:hover .ig-svg { transform: scale(1.12) rotate(-6deg); }

        .ig-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.6), transparent);
          transform: translateX(-170%) skewX(-18deg);
          pointer-events: none;
          animation: tt-shine 4.5s ease-in-out 1.6s infinite;
        }

        .ig-logo:focus-visible { outline: none; }
        .ig-logo:focus-visible .ig-face { box-shadow: 0 0 0 4px rgba(82,183,136,.6); }

        html { scroll-behavior: smooth; }
        #apropos { scroll-margin-top: 80px; }

        @media (prefers-reduced-motion: reduce) {
          .bg-fade-up, .bg-pulse, .bg-header, .bg-float, .bg-gradient-text,
          .bg-hero-frame, .bg-badge-pop, .bg-card-img, .bg-card-badge,
          .about-cta-glow, .about-orbit, .about-ring, .about-leaf-float, .about-word,
          .about-heading-reveal, .about-panel, .about-video-reveal, .about-line,
          .about-arrow {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
            clip-path: none !important;
          }

          .bg-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
          .bg-card, .bg-card:hover, .bg-card-img, .bg-card:hover .bg-card-img { transform: none !important; transition: none !important; }
          .bg-conseil, .bg-conseil::after, .bg-sparkle, .bg-spark-dot, .bg-btn:hover::after { animation: none !important; }
          .bg-btn, .bg-btn:hover, .bg-btn:active { transform: none !important; }
          .logo-swap-in, .tt-logo, .tt-face, .tt-ring, .tt-shine, .tt-note-white, .tt-note-cyan, .tt-note-pink { animation: none !important; }
          .tt-ring, .tt-shine { display: none; }
          .tt-logo:hover .tt-svg { transform: none !important; }
          .ig-logo, .ig-face, .ig-ring, .ig-shine, .ig-svg { animation: none !important; }
          .ig-ring, .ig-shine { display: none; }
          .ig-logo:hover .ig-svg { transform: none !important; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      {/* HEADER */}
      <header className="bg-header sticky top-0 z-50 bg-gradient-to-r from-[#0F2D20] via-[#1B4332] to-[#2D6A4F] shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Logo Beauté Bio by Gnilane"
              className="h-11 w-11 rounded-full border-2 border-[#D4AF37] bg-white object-contain p-0.5 shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-105"
            />
            <div>
              <p className="font-serif text-lg font-bold tracking-wide text-white sm:text-xl">
                {BRAND.name}
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#B7E4C7]">
                {BRAND.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex">
            <Link href="/" className="bg-nav-link font-bold text-white">
              Accueil
            </Link>
            <Link
              href="/produits"
              className="bg-nav-link text-[#E3F3E8] transition hover:text-[#F5D76E]"
            >
              Nos produits
            </Link>
            <Link
              href="#apropos"
              className="bg-nav-link text-[#E3F3E8] transition hover:text-[#F5D76E]"
            >
              À propos
            </Link>
            <Link
              href="#contact"
              className="bg-nav-link text-[#E3F3E8] transition hover:text-[#F5D76E]"
            >
              Contact
            </Link>
            <Link
              href="/conseils"
              className="bg-btn bg-conseil inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <Sparkles size={16} className="bg-sparkle" />
              Conseils beauté
              <span className="bg-spark-dot" style={{ top: 6, right: 12 }} />
              <span
                className="bg-spark-dot"
                style={{ bottom: 6, left: 14, animationDelay: "1s" }}
              />
            </Link>
            <Link
              href="/panier"
              className="bg-btn rounded-full border-2 border-[#D4AF37] px-6 py-2.5 font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#D4AF37] hover:text-[#1B4332] hover:shadow-lg"
            >
              Mon panier
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/conseils"
              aria-label="Conseils beauté"
              className="bg-btn bg-conseil inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold"
            >
              <Sparkles size={15} className="bg-sparkle" />
              Conseils
            </Link>
            <Link
              href="/panier"
              className="bg-btn rounded-full bg-[#D4AF37] px-5 py-2.5 text-xs font-bold text-[#1B4332] shadow-md transition hover:bg-[#E5CC72] active:scale-95 md:hidden"
            >
              Panier
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#F4FAF5] via-white to-[#E3F3E8]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full border border-[#D4AF37]/30" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full border border-[#2D6A4F]/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-[#B7E4C7]/50 blur-3xl" />

        <Leaf className="bg-float pointer-events-none absolute left-[6%] top-20 hidden h-16 w-16 text-[#52B788]/25 lg:block" />
        <Leaf className="bg-float pointer-events-none absolute bottom-24 right-[8%] hidden h-24 w-24 text-[#2D6A4F]/10 lg:block" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:py-16">
          <div className="bg-fade-up">
            <div className="flex flex-wrap items-center gap-5">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#52B788]/50 bg-white px-4 py-2 shadow-sm">
                <span className="bg-pulse h-2 w-2 rounded-full bg-[#52B788]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1B4332]">
                  Le naturel au quotidien
                </span>
              </div>

              <div className="flex items-center gap-14">
                {activeLogo === "tiktok" ? (
                  <span key="tiktok" className="logo-swap-in flex">
                    <a
                      href={TIKTOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Voir notre TikTok"
                      className="tt-logo"
                    >
                      <span className="tt-ring" aria-hidden="true" />
                      <span className="tt-ring tt-ring-2" aria-hidden="true" />
                      <span className="tt-face">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="tt-svg">
                          <defs>
                            <path
                              id="tt-note-path"
                              d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                            />
                          </defs>
                          <use href="#tt-note-path" fill="#25F4EE" className="tt-note-cyan" />
                          <use href="#tt-note-path" fill="#FE2C55" className="tt-note-pink" />
                          <use href="#tt-note-path" fill="#FFFFFF" className="tt-note-white" />
                        </svg>
                        <span className="tt-shine" aria-hidden="true" />
                      </span>
                    </a>
                  </span>
                ) : (
                  <span key="instagram" className="logo-swap-in flex">
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Voir notre Instagram"
                      className="ig-logo"
                    >
                      <span className="ig-ring" aria-hidden="true" />
                      <span className="ig-ring ig-ring-2" aria-hidden="true" />
                      <span className="ig-face">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="ig-svg">
                          <rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                          <circle cx="12" cy="12" r="4.2" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                          <circle cx="17.3" cy="6.7" r="1.3" fill="#FFFFFF" />
                        </svg>
                        <span className="ig-shine" aria-hidden="true" />
                      </span>
                    </a>
                  </span>
                )}
              </div>
            </div>

            <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-[1.15] text-[#1B4332] sm:text-5xl lg:text-6xl">
              Prenez soin de vous
              <span className="bg-gradient-text block bg-gradient-to-r from-[#2D6A4F] via-[#52B788] to-[#D4AF37] bg-clip-text text-transparent">
                Rayonnez chaque jour.
              </span>
            </h1>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/produits"
                className="bg-btn group inline-flex items-center justify-center gap-3 rounded-full bg-[#2D6A4F] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#2D6A4F]/25 transition duration-300 hover:-translate-y-1 hover:bg-[#1B4332] hover:shadow-2xl active:scale-95"
              >
                Découvrir la boutique
                <span className="bg-arrow">→</span>
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-btn inline-flex items-center justify-center rounded-full border-2 border-[#1B4332] px-7 py-3.5 text-sm font-semibold text-[#1B4332] transition duration-300 hover:-translate-y-1 hover:bg-[#1B4332] hover:text-white active:scale-95"
              >
                Nous contacter
              </a>

              <Link
                href="/conseils"
                className="bg-btn bg-conseil inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold shadow-md"
              >
                <Sparkles size={20} className="bg-sparkle" />
                Conseils beauté
                <span className="bg-spark-dot" style={{ top: 8, right: 18 }} />
                <span
                  className="bg-spark-dot"
                  style={{ bottom: 8, left: 22, animationDelay: "1s" }}
                />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#D3E8D9] pt-5">
              <div>
                <p className="font-serif text-xl font-bold text-[#2D6A4F]">
                  {BRAND.name}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#7A8F83]">
                  Votre boutique beauté
                </p>
              </div>

              <div className="h-9 w-px bg-[#D4AF37]" />

              <div>
                <p className="text-sm font-bold text-[#1B4332]">
                  Livraison partout
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#7A8F83]">
                  La livraison groupée est aussi disponible
                </p>
              </div>
            </div>
          </div>

          {/* DIAPORAMA HERO */}
          <div className="bg-fade-up bg-delay-2 relative mx-auto w-full max-w-md">
            <div className="absolute inset-8 rounded-full bg-[#74C69D]/40 blur-3xl" />

            <div className="bg-hero-frame relative overflow-hidden rounded-[2rem] border-2 border-[#D4AF37] bg-white p-2.5 shadow-2xl">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#1B4332]">
                {currentSlide ? (
                  <Link
                    href="/produits"
                    className="group relative block h-[340px] overflow-hidden sm:h-[400px]"
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

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D20]/95 via-[#0F2D20]/10 to-[#0F2D20]/20" />

                    <span className="absolute left-4 top-4 rounded-full border border-[#B7E4C7] bg-[#1B4332]/95 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#B7E4C7] shadow-lg">
                      🌿 Sélection
                    </span>

                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#B7E4C7]">
                        Découvrez notre collection
                      </p>

                      <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                        {currentSlide.name}
                      </h2>

                      <p className="mt-3 font-serif text-xl font-bold text-[#F5D76E]">
                        {currentSlide.price.toLocaleString("fr-FR")}
                        <span className="ml-2 text-sm font-semibold">
                          FCFA
                        </span>
                      </p>

                      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                        <div
                          key={`progress-${currentSlide.id}`}
                          className="h-full rounded-full bg-[#74C69D]"
                          style={{
                            animation: `bg-progress ${SLIDE_DURATION}ms linear both`,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-white/80">
                          Produit {slideIndex + 1} sur {slideProducts.length}
                        </p>
                        <span className="text-sm font-semibold text-[#B7E4C7] transition group-hover:translate-x-1">
                          Découvrir →
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex h-[340px] items-center justify-center px-6 text-center text-[#B7E4C7] sm:h-[400px]">
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

        <div className="relative border-t border-[#D3E8D9] bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1B4332] sm:text-xs">
            <span className="bg-fade-up" style={{ animationDelay: ".6s" }}>
              🌿 Soins visage
            </span>
            <span className="bg-fade-up" style={{ animationDelay: ".75s" }}>
              🌿 Soins corps
            </span>
            <span className="bg-fade-up" style={{ animationDelay: ".9s" }}>
              🌿 Cheveux
            </span>
            <span className="bg-fade-up" style={{ animationDelay: "1.05s" }}>
              🌿 Produits naturels
            </span>
          </div>
        </div>
      </section>

      {/* PRODUITS POPULAIRES */}
      <section className="bg-white px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1B4332] sm:text-2xl">
                QUELQUES PRODUITS.
              </h2>

            </div>

            <Link
              href="/produits"
              className="group inline-flex items-center gap-3 text-sm font-bold text-[#2D6A4F] transition hover:text-[#1B4332]"
            >
              Toute la collection{" "}
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {popularProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.12}>
                <article className="bg-card group overflow-hidden rounded-[1.25rem] border border-[#D3E8D9] bg-white shadow-sm hover:border-[#52B788] hover:shadow-2xl hover:shadow-[#2D6A4F]/20">
                  <Link
                    href="/produits"
                    className="bg-card-media relative block aspect-[4/5] overflow-hidden bg-[#E3F3E8]"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="bg-card-img h-full w-full object-cover"
                      style={{ animationDelay: `${index * 0.12}s` }}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F2D20]/45 via-transparent to-white/10 transition duration-500 group-hover:from-[#1B4332]/55" />

                    <span className="bg-card-shine" aria-hidden="true" />

                    <span
                      className="bg-card-badge absolute left-2.5 top-2.5 z-10 rounded-full border border-[#D4AF37]/70 bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#1B4332] shadow-md backdrop-blur"
                      style={{ animationDelay: `${0.4 + index * 0.12}s` }}
                    >
                      Sélection
                    </span>

                    <div className="absolute bottom-2.5 right-2.5 z-10 flex h-9 w-9 translate-y-3 items-center justify-center rounded-full border border-[#D4AF37] bg-[#2D6A4F] text-base text-white opacity-0 shadow-lg transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-hover:rotate-[360deg]">
                      →
                    </div>
                  </Link>

                  <div className="p-3 sm:p-4">
                    <h3 className="line-clamp-2 min-h-[40px] text-xs font-semibold leading-5 text-[#1F3A2D] transition-colors duration-300 group-hover:text-[#1B4332] sm:text-sm">
                      {product.name}
                    </h3>

                    <div className="bg-card-line mt-2.5" />

                    <div className="mt-2.5 flex flex-col gap-1.5 border-t border-[#E3F3E8] pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-serif text-base font-bold text-[#B8860B] sm:text-lg">
                        {product.price.toLocaleString("fr-FR")}
                        <span className="ml-1 text-[9px] font-bold">
                          FCFA
                        </span>
                      </p>

                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#2D6A4F] transition duration-300 group-hover:translate-x-1">
                        Découvrir →
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8 text-center" delay={0.2}>
            <Link
              href="/produits"
              className="bg-btn bg-pulse inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2D6A4F]/25 transition duration-300 hover:-translate-y-1 hover:bg-[#1B4332] active:scale-95"
            >
              Explorer tous les produits
              <span className="bg-arrow text-lg text-[#F5D76E]">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* À PROPOS */}
      <section
        id="apropos"
        className="relative isolate overflow-hidden bg-gradient-to-br from-[#0F2D20] via-[#1B4332] to-[#2D6A4F] px-5 py-12 text-white sm:px-8 sm:py-16"
      >
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#52B788]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#B7E4C7]/25" />

        <Leaf className="about-leaf-float pointer-events-none absolute left-[8%] top-16 hidden h-16 w-16 text-[#B7E4C7]/35 md:block" />
        <Leaf className="about-leaf-float pointer-events-none absolute bottom-16 right-[8%] hidden h-24 w-24 rotate-45 text-[#B7E4C7]/25 md:block" />

        <div className="relative mx-auto max-w-6xl text-center">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B7E4C7]">
              Notre univers
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
              Entrez dans l'univers Beauté Bio
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#E3F3E8]">
              Une boutique pensée autour de la beauté, du naturel et du
              bien-être.
            </p>
          </Reveal>

          <div className="relative mx-auto mt-6 flex max-w-4xl items-center justify-center px-14 py-8 sm:px-24 sm:py-10">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="about-orbit absolute h-48 w-48 rounded-full border border-dashed border-[#D4AF37]/65 sm:h-60 sm:w-60" />
              <div className="absolute h-40 w-40 rounded-full border border-[#B7E4C7]/30 sm:h-52 sm:w-52" />
              <div className="about-ring absolute h-40 w-40 rounded-full border border-[#B7E4C7]/40 sm:h-52 sm:w-52" />
              <div className="about-ring about-ring-2 absolute h-40 w-40 rounded-full border border-[#D4AF37]/40 sm:h-52 sm:w-52" />
            </div>

            {!aboutOpen && (
              <>
                <span aria-hidden="true" className="about-arrow about-arrow-top">
                  ↓
                </span>
                <span aria-hidden="true" className="about-arrow about-arrow-bottom">
                  ↑
                </span>
                <span aria-hidden="true" className="about-arrow about-arrow-left">
                  →
                </span>
                <span aria-hidden="true" className="about-arrow about-arrow-right">
                  ←
                </span>
              </>
            )}

            <button
              type="button"
              onClick={handleAboutClick}
              aria-expanded={aboutOpen}
              aria-controls="about-content"
              className="bg-btn about-cta-glow group relative z-10 inline-flex min-h-28 w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border-2 border-[#D4AF37]/90 bg-[#2D6A4F] px-5 py-6 text-white shadow-xl transition duration-500 hover:-translate-y-1 hover:bg-[#245B42] focus:outline-none focus:ring-4 focus:ring-[#B7E4C7]/70 active:scale-[.98] sm:min-h-36 sm:px-7"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#B7E4C7]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

              <span className="relative mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/80 bg-[#1B4332] font-serif text-xl text-[#F5D76E] transition duration-500 group-hover:rotate-12 group-hover:scale-110">
                {aboutOpen ? "−" : "✦"}
              </span>

              <span className="relative font-serif text-xl font-bold tracking-wide text-white sm:text-2xl">
                {aboutOpen ? "Fermer la présentation" : "Voir la description"}
              </span>

              <span className="relative mt-2 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-[#E3F3E8] sm:text-[10px] sm:tracking-[0.22em]">
                {aboutOpen
                  ? "Cliquez pour refermer"
                  : "Cliquez pour voir la description"}
              </span>
            </button>
          </div>

          {aboutOpen && (
            <div
              id="about-content"
              ref={aboutContentRef}
              className="about-panel mx-auto mt-8 max-w-4xl scroll-mt-24 rounded-[1.75rem] border border-[#B7E4C7] bg-gradient-to-br from-[#E3F3E8] via-[#D5EBDD] to-[#B7E4C7] px-6 py-8 shadow-[0_22px_75px_rgba(0,0,0,0.22)] sm:px-12 sm:py-10"
            >
              <p className="about-heading-reveal text-[10px] font-bold uppercase tracking-[0.35em] text-[#8A6A16]">
                Notre univers
              </p>

              <h3
                className="about-heading-reveal mt-3 font-serif text-3xl font-bold leading-tight text-[#1B4332] sm:text-4xl"
                style={{ animationDelay: ".15s" }}
              >
                Bienvenue chez Beauté Bio by Gnilane
              </h3>

              <div className="about-line mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#D4AF37]" />

              <div className="mx-auto mt-6 max-w-3xl space-y-4 text-center font-serif text-base leading-[1.8] text-[#234B36] sm:text-lg sm:leading-[1.9]">
                {ABOUT_PARAGRAPHS.map((paragraph, index) => (
                  <p
                    key={`about-paragraph-${index}`}
                    className="[text-wrap:pretty]"
                  >
                    <AnimatedWords
                      text={paragraph}
                      delay={ABOUT_PARAGRAPH_DELAYS[index]}
                    />
                  </p>
                ))}
              </div>

              <div
                className="about-heading-reveal mx-auto mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-[#D4AF37]/70 bg-[#F4FAF5]/75 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1B4332] shadow-sm"
                style={{
                  animationDelay: `${(ABOUT_WORD_COUNT - 1) * 0.09 + 0.75}s`,
                }}
              >
                <span>Beauté</span>
                <span className="text-[#D4AF37]">✦</span>
                <span>Naturel</span>
                <span className="text-[#D4AF37]">✦</span>
                <span>Bien-être</span>
              </div>

              {showAboutVideo && (
                <div className="about-video-reveal mx-auto mt-8 w-full max-w-[340px] overflow-hidden rounded-[1.75rem] border-2 border-[#D4AF37] bg-black p-1.5 shadow-[0_25px_75px_rgba(27,67,50,.20)]">
                  <div className="overflow-hidden rounded-[1.25rem] bg-black">
                    <video
                      ref={videoRef}
                      src="/video32.mp4"
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
                </div>
              )}

              <p
                className="about-heading-reveal mt-6 font-serif text-lg font-bold tracking-wide text-[#1B4332] sm:text-xl"
                style={{
                  animationDelay: showAboutVideo
                    ? ".4s"
                    : `${(ABOUT_WORD_COUNT - 1) * 0.09 + 1.1}s`,
                }}
              >
                Merci de faire partie de notre univers.
              </p>

              <div
                className="about-heading-reveal mt-5 flex justify-center"
                style={{
                  animationDelay: showAboutVideo
                    ? ".7s"
                    : `${(ABOUT_WORD_COUNT - 1) * 0.09 + 1.4}s`,
                }}
              >
                <button
                  type="button"
                  onClick={handleAboutClose}
                  className="about-close inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] px-7 py-3 text-sm font-bold text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-[#52B788]/50 hover:bg-[#1B4332]"
                >
                  <span className="about-close-icon flex h-7 w-7 items-center justify-center rounded-full border border-[#D4AF37]/80 bg-[#1B4332] text-base text-[#F5D76E]">
                    ✕
                  </span>
                  Fermer la page
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="relative overflow-hidden bg-white px-5 py-12 sm:px-8 sm:py-16"
      >
        <div className="bg-float absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#D4AF37]/30" />

        <Reveal className="relative mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#2D6A4F]">
            Restons en contact
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#1B4332] sm:text-4xl">
            Une envie ? Une commande ?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5B7A68]">
            Notre équipe est disponible pour vous accompagner dans vos
            commandes et répondre à vos questions.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-btn bg-pulse mt-6 inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] px-8 py-3.5 text-sm font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#1B4332] active:scale-95"
          >
            <span className="text-lg text-[#F5D76E]">✆</span>
            WhatsApp · {BRAND.phoneDisplay}
            <span className="bg-arrow text-[#F5D76E]">→</span>
          </a>

          <p className="mt-4 text-xs text-[#2D6A4F]">
            🚚 Livraison partout
          </p>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0F2D20] px-5 py-8 text-[#E3F3E8] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <Reveal>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#2D6A4F] font-serif text-base font-bold text-white">
                {BRAND.initials}
              </div>
              <span className="font-serif text-xl font-bold text-white">
                {BRAND.name}
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-xs leading-6 text-[#CFE6D6]">
              Votre boutique de beauté naturelle. Découvrez notre univers et
              notre sélection de produits.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B7E4C7]">
              Navigation
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link
                href="/"
                className="w-fit transition hover:translate-x-1 hover:text-[#B7E4C7]"
              >
                Accueil
              </Link>
              <Link
                href="/produits"
                className="w-fit transition hover:translate-x-1 hover:text-[#B7E4C7]"
              >
                Nos produits
              </Link>
              <Link
                href="/panier"
                className="w-fit transition hover:translate-x-1 hover:text-[#B7E4C7]"
              >
                Mon panier
              </Link>
              <Link
                href="/conseils"
                className="w-fit transition hover:translate-x-1 hover:text-[#B7E4C7]"
              >
                Conseils beauté
              </Link>
              <Link
                href="#apropos"
                className="w-fit transition hover:translate-x-1 hover:text-[#B7E4C7]"
              >
                À propos
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B7E4C7]">
              Nous contacter
            </h3>

            <div className="mt-3 space-y-2 text-sm">
              <p>🚚 Livraison partout</p>
              <p>☎ {BRAND.phoneDisplay}</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[#B7E4C7] transition hover:translate-x-1 hover:text-white"
              >
                Écrire sur WhatsApp →
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/15 pt-5 text-center">
          <p className="text-xs text-[#CFE6D6]">
            © {new Date().getFullYear()} {siteConfig.shopName}. Tous droits
            réservés.
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
            Beauté · Naturel · Bio
          </p>
        </div>
      </footer>
    </main>
  );
}