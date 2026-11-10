"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowLeft, Send, ShoppingBag, X } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string | null;
  available_on_order?: boolean;
  stock?: boolean;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  metadata?: { recommended_products?: Product[]; needs_human?: boolean };
  created_at?: string;
};

type Conversation = {
  id: string;
  status: string;
  last_user_question: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

/* -------------------------------------------------------------------------- */
/*  Constantes                                                                */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "beauty_conseil_conversation_id";
const NAME_STORAGE_KEY = "beauty_conseil_customer_name";

const MESSAGES_POLL_MS = 4000;
const ADMIN_POLL_MS = 10000;
const SECRET_CLICKS_REQUIRED = 5;
const SECRET_CLICKS_WINDOW_MS = 2200;
const PIN_LENGTH = 6;
const MAX_MESSAGE_LENGTH = 1500;

/** Quatre questions maximum, reformulées à partir des questions de Gnilane. */
const SUGGESTIONS = [
  "J'ai des problèmes de peau, pouvez-vous me conseiller ?",
  "Pouvez-vous m'aider à identifier mon type de teint ?",
  "Quel produit me conviendrait le mieux ?",
  "Je voudrais commander un produit",
];


const WELCOME_LINES = [
  "Avez-vous des problèmes de peau ?",
  "Si oui, lesquels ?",
  "Vous cherchez quel genre de produit ?",
  "Posez toutes vos questions à Gnilane.",
  "Gnilane vous conseillera.",
];

const PRODUCTS: Product[] = [
  { id: "1", name: "Savon vert au Mbeurbeuff", price: 1500, image: "/1%20(1).jpeg", category: "Savons" },
  { id: "2", name: "Savon Mbeurbeuff beige", price: 1500, image: "/1%20(2).jpeg", category: "Savons" },
  { id: "3", name: "Savon collagène", price: 2000, image: "/1%20(3).jpeg", category: "Savons" },
  { id: "4", name: "Crème de visage hydratante anti-taches", price: 3500, image: "/1%20(4).jpeg", category: "Soins du visage" },
  { id: "5", name: "Huile au Mbeurbeuff", price: 3500, image: "/1%20(5).jpeg", category: "Soins du corps" },
  { id: "6", name: "Shampoing au Mbeurbeuff", price: 5500, image: "/1%20(6).jpeg", category: "Cheveux" },
  { id: "7", name: "Gel de douche au Mbeurbeuff", price: 5500, image: "/1%20(7).jpeg", category: "Soins du corps" },
  { id: "8", name: "Duo crème + huile", price: 6500, image: "/1%20(8).jpeg", category: "Packs" },
  { id: "9", name: "Savon au curcuma", price: 1500, image: "/1%20(9).jpeg", category: "Savons" },
  { id: "10", name: "Savon nep nep", price: 1500, image: "/1%20(10).jpeg", category: "Savons" },
  { id: "11", name: "Gamme complète au Mbeurbeuff", price: 28000, image: "/1%20(11).jpeg", category: "Packs", available_on_order: true },
  { id: "12", name: "Lait de corps au Mbeurbeuff", price: 8000, image: "/1%20(12).jpeg", category: "Soins du corps" },
];

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                               */
/* -------------------------------------------------------------------------- */

const money = (value: number) => `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function statusLabel(status: string) {
  switch (status) {
    case "waiting_gnilane":
      return "En attente de Gnilane";
    case "answered":
      return "Réponse envoyée";
    case "closed":
      return "Terminée";
    default:
      return "En cours";
  }
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible (navigation privée, quota…) : on ignore */
  }
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function requestJson<T>(url: string, fallbackError: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error || fallbackError, res.status);
  return data as T;
}

const postJson = <T,>(url: string, body: unknown, fallbackError: string) =>
  requestJson<T>(url, fallbackError, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

/** Détecte N clics rapprochés (accès secret à l'espace Gnilane). */
function useSecretClicks(onTrigger: () => void) {
  const clicks = useRef<number[]>([]);
  return useCallback(() => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < SECRET_CLICKS_WINDOW_MS), now];
    if (clicks.current.length >= SECRET_CLICKS_REQUIRED) {
      clicks.current = [];
      onTrigger();
    }
  }, [onTrigger]);
}

/** Conversation de la cliente : identifiant persistant, messages, envoi. */
function useCustomerChat() {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let id = readStorage(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      writeStorage(STORAGE_KEY, id);
    }
    setConversationId(id);
    setCustomerName(readStorage(NAME_STORAGE_KEY) || "");
  }, []);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data = await requestJson<{ messages?: Message[] }>(
        `/api/conseil/chat?conversationId=${encodeURIComponent(conversationId)}`,
        "Impossible de charger les messages.",
        { cache: "no-store" },
      );
      if (Array.isArray(data.messages)) setMessages(data.messages);
      setLoadError("");
    } catch (e) {
      setLoadError(errorMessage(e, "Connexion instable, nouvelle tentative…"));
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    void loadMessages();
    const timer = window.setInterval(() => void loadMessages(), MESSAGES_POLL_MS);
    return () => window.clearInterval(timer);
  }, [conversationId, loadMessages]);

  const updateCustomerName = useCallback((value: string) => {
    setCustomerName(value);
    writeStorage(NAME_STORAGE_KEY, value);
  }, []);

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (sending || !conversationId) return;
      if (text.length < 2) {
        setError("Votre message est trop court.");
        return;
      }

      const name = customerName.trim();
      const content = `${name ? `${name} — ` : ""}${text}`;
      const optimistic: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };

      setSending(true);
      setError("");
      setDraft("");
      setMessages((current) => [...current, optimistic]);

      try {
        await postJson("/api/conseil/chat", { conversationId, message: content }, "Votre message n'a pas pu être envoyé.");
        await loadMessages();
      } catch (e) {
        setError(errorMessage(e, "Une erreur est survenue."));
        setDraft(text);
        setMessages((current) => current.filter((m) => m.id !== optimistic.id));
      } finally {
        setSending(false);
      }
    },
    [sending, conversationId, customerName, loadMessages],
  );

  return {
    messages,
    draft,
    setDraft,
    customerName,
    updateCustomerName,
    sending,
    loadingMessages,
    error,
    loadError,
    sendText,
  };
}

type ChatState = ReturnType<typeof useCustomerChat>;

/** Espace Gnilane : connexion par code, liste des demandes, réponses. */
function useAdmin() {
  const [showLogin, setShowLogin] = useState(false);
  const [pin, setPin] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const loadQuestions = useCallback(async () => {
    try {
      const data = await requestJson<{ conversations?: Conversation[] }>(
        "/api/admin/questions",
        "Chargement des demandes impossible.",
        { cache: "no-store" },
      );
      const list = Array.isArray(data.conversations) ? data.conversations : [];
      setItems(list);
      setSelectedId((current) => current || list[0]?.id || "");
      setError("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setIsAdmin(false);
        setError("Session administratrice expirée. Reconnectez-vous.");
        return;
      }
      setError(errorMessage(e, "Erreur administratrice."));
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void loadQuestions();
    const timer = window.setInterval(() => void loadQuestions(), ADMIN_POLL_MS);
    return () => window.clearInterval(timer);
  }, [isAdmin, loadQuestions]);

  const openLogin = useCallback(() => {
    setPin("");
    setError("");
    setShowLogin(true);
  }, []);

  const closeLogin = useCallback(() => setShowLogin(false), []);

  const login = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setLoginLoading(true);
      setError("");
      try {
        await postJson("/api/admin/login", { pin }, "Accès refusé.");
        setShowLogin(false);
        setIsAdmin(true);
        await loadQuestions();
      } catch (e) {
        setError(errorMessage(e, "Connexion impossible."));
      } finally {
        setLoginLoading(false);
      }
    },
    [pin, loadQuestions],
  );

  const logout = useCallback(() => {
    setIsAdmin(false);
    setItems([]);
  }, []);

  const selected = useMemo(() => items.find((x) => x.id === selectedId), [items, selectedId]);

  const stats = useMemo(
    () => [
      { label: "Total conversations", value: items.length },
      { label: "En attente", value: items.filter((x) => x.status === "waiting_gnilane").length },
      { label: "Répondues", value: items.filter((x) => x.status === "answered").length },
      { label: "En cours", value: items.filter((x) => x.status === "open").length },
    ],
    [items],
  );

  const submitAnswer = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!selected || answer.trim().length < 2) return;
      setBusy(true);
      setError("");
      try {
        await postJson(
          "/api/admin/repondre",
          { conversationId: selected.id, answer: answer.trim() },
          "Réponse non enregistrée.",
        );
        setAnswer("");
        await loadQuestions();
      } catch (e) {
        setError(errorMessage(e, "Erreur lors de l'envoi."));
      } finally {
        setBusy(false);
      }
    },
    [selected, answer, loadQuestions],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (deletingId) return;
      const confirmed = window.confirm(
        "Voulez-vous vraiment supprimer cette conversation et tous ses messages ? Cette action est définitive.",
      );
      if (!confirmed) return;

      setDeletingId(conversationId);
      setError("");
      try {
        await requestJson("/api/admin/questions", "Impossible de supprimer cette conversation.", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        });
        setItems((current) => current.filter((item) => item.id !== conversationId));
        if (selectedId === conversationId) {
          setSelectedId("");
          setAnswer("");
        }
        await loadQuestions();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          setIsAdmin(false);
          setError("Session administratrice expirée. Reconnectez-vous.");
        } else {
          setError(errorMessage(e, "Erreur lors de la suppression."));
        }
      } finally {
        setDeletingId("");
      }
    },
    [deletingId, selectedId, loadQuestions],
  );

  return {
    showLogin, openLogin, closeLogin,
    pin, setPin, loginLoading, login,
    isAdmin, logout,
    items, selected, selectedId, setSelectedId,
    stats, answer, setAnswer, submitAnswer,
    error, busy, reload: loadQuestions,
    deleteConversation, deletingId,
  };
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */

function ChatStyles() {
  return (
    <style jsx global>{`
      @keyframes csMsgIn { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
      @keyframes csPopIn { from { opacity: 0; transform: translateY(6px) scale(0.96); } to { opacity: 1; transform: none; } }
      @keyframes csFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes csFadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes csSheetIn { from { transform: translateY(100%); } to { transform: none; } }
      @keyframes csSheetOut { from { transform: none; } to { transform: translateY(100%); } }
      @keyframes csDot { 0%, 80%, 100% { transform: translateY(0); opacity: 0.35; } 40% { transform: translateY(-5px); opacity: 1; } }
      @keyframes csOnline { 0% { box-shadow: 0 0 0 0 rgba(82, 183, 136, 0.6); } 70%, 100% { box-shadow: 0 0 0 7px rgba(82, 183, 136, 0); } }
      @keyframes csSpin { to { transform: rotate(360deg); } }
      @keyframes csShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

      .cs-msg-in { animation: csMsgIn 0.36s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
      .cs-pop { animation: csPopIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
      .cs-chip { animation: csPopIn 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; }
      .cs-item { animation: csPopIn 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; }
      .cs-backdrop-in { animation: csFadeIn 0.3s ease both; }
      .cs-backdrop-out { animation: csFadeOut 0.26s ease both; }
      .cs-sheet-in { animation: csSheetIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .cs-sheet-out { animation: csSheetOut 0.26s cubic-bezier(0.4, 0, 1, 1) both; }
      .cs-dot { animation: csDot 1.2s ease-in-out infinite; }
      .cs-online { animation: csOnline 2s ease-out infinite; }
      .cs-spin { animation: csSpin 0.8s linear infinite; }
      .cs-shake { animation: csShake 0.4s ease; }

      .cs-send { transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease; }
      .cs-send:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 10px 20px -10px rgba(27, 67, 50, 0.6); }
      .cs-send:not(:disabled):active { transform: scale(0.92); }

      .cs-scroll { scrollbar-width: thin; scrollbar-color: #b7d9c2 transparent; }

      @media (prefers-reduced-motion: reduce) {
        .cs-msg-in, .cs-pop, .cs-chip, .cs-item, .cs-backdrop-in, .cs-backdrop-out,
        .cs-sheet-in, .cs-sheet-out, .cs-dot, .cs-online, .cs-spin, .cs-shake {
          animation: none !important;
        }
        .cs-send { transition: none !important; }
      }
    `}</style>
  );
}

function AppStyles() {
  return (
    <style jsx global>{`
      @keyframes beautyFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes beautyEnter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes beautyPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.55); }
        50% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
      }

      .beauty-float { animation: beautyFloat 5s ease-in-out infinite; }
      .beauty-enter { animation: beautyEnter 0.65s ease both; }
      .beauty-pulse { animation: beautyPulse 2.8s ease-in-out infinite; }
      .beauty-pulse:hover { animation: none; }

      .beauty-app button {
        transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease,
          color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease;
      }
      .beauty-app button:not(:disabled):not(.beauty-flat):not([role="tab"]):hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 22px -10px rgba(27, 67, 50, 0.55);
      }
      .beauty-app button:not(:disabled):active { transform: scale(0.96); }
      .beauty-app button:disabled { cursor: not-allowed; }
      .beauty-app button:focus-visible,
      .beauty-app a:focus-visible { outline: 2px solid #d4af37; outline-offset: 2px; }

      .beauty-shine { position: relative; overflow: hidden; }
      .beauty-shine::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
        transform: translateX(-120%);
        transition: transform 0.7s ease;
      }
      .beauty-shine:not(:disabled):hover::after { transform: translateX(120%); }

      .beauty-arrow { display: inline-block; transition: transform 0.3s ease; }
      button:hover > .beauty-arrow,
      a:hover > .beauty-arrow { transform: translateX(6px); }

      @media (prefers-reduced-motion: reduce) {
        .beauty-float, .beauty-enter, .beauty-pulse { animation: none !important; }
        .beauty-app button, .beauty-shine::after, .beauty-arrow { transition: none !important; }
        .beauty-app button:hover, .beauty-app button:active { transform: none !important; }
      }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/*  Messages                                                                  */
/* -------------------------------------------------------------------------- */

/** Bulle de l'espace Gnilane (administration). */
function MessageBubble({ message, variant }: { message: Message; variant: "client" | "admin" }) {
  const isUser = message.role === "user";
  const isAdminMsg = message.role === "admin";
  const isClientView = variant === "client";

  const tone = isUser
    ? `bg-[#2D6A4F] text-white ${isClientView ? "rounded-br-sm" : ""}`
    : isAdminMsg
      ? `border border-[#E7D9A8] bg-[#FFF9E8] text-[#493D1B] ${isClientView ? "rounded-bl-sm" : ""}`
      : `border border-[#D7EBDD] bg-white text-[#244333] ${isClientView ? "rounded-bl-sm" : ""}`;

  const label = isClientView
    ? isAdminMsg ? "Réponse de Gnilane" : "Conseiller beauté"
    : isUser ? "Cliente" : isAdminMsg ? "Gnilane" : "Conseiller beauté";

  const sizing = isClientView
    ? "max-w-[92%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[82%]"
    : "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6";

  const products = isClientView ? message.metadata?.recommended_products : undefined;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${sizing} ${tone}`}>
        {(!isClientView || !isUser) && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-65">{label}</p>
        )}
        <p className={`whitespace-pre-wrap ${isClientView ? "text-sm leading-7" : ""}`}>{message.content}</p>

        {products?.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-xl border border-[#D7EBDD] bg-white text-[#1B4332]">
                <img src={p.image} alt={p.name} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <p className="text-xs font-bold">{p.name}</p>
                  <p className="mt-1 text-sm font-bold text-[#9B7613]">{money(p.price)}</p>
                  <a href="/produits" className="mt-2 inline-flex rounded-full bg-[#2D6A4F] px-3 py-2 text-xs font-bold text-white">
                    Voir le produit
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {isClientView && message.created_at && (
          <p className="mt-2 text-right text-[9px] opacity-55">
            {new Date(message.created_at).toLocaleString("fr-FR")}
          </p>
        )}
      </div>
    </div>
  );
}

/** Bulle de la cliente, du conseiller ou de Gnilane. */
function ChatBubble({ message }: { message: Message }) {
  const mine = message.role === "user";
  const fromGnilane = message.role === "admin";
  const products = message.metadata?.recommended_products ?? [];

  const bubbleTone = mine
    ? "rounded-br-md bg-[#2D6A4F] text-white"
    : fromGnilane
      ? "rounded-bl-md border border-[#E7D9A8] bg-[#FFFBEF] text-[#3F3414]"
      : "rounded-bl-md border border-[#D7EBDD] bg-white text-[#244333]";

  return (
    <div className={`cs-msg-in flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine &&
  (fromGnilane ? (
    <img
      src="/logo.jpg"
      alt=""
      aria-hidden="true"
      className="h-7 w-7 shrink-0 rounded-full border border-[#D4AF37] bg-white object-contain p-0.5"
    />
  ) : (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E5F2E8] text-[10px] font-bold text-[#2D6A4F]"
      aria-hidden="true"
    >
      ✿
    </span>
  ))}

      <div className={`flex max-w-[82%] flex-col sm:max-w-[70%] ${mine ? "items-end" : "items-start"}`}>
        {!mine && (
          <span className="mb-1 ml-1 text-[11px] font-semibold text-[#6B8B78]">
            {fromGnilane ? "Gnilane" : "Conseiller beauté"}
          </span>
        )}

        <div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[15px] leading-7 shadow-sm ${bubbleTone}`}>
          {message.content}
        </div>

        {products.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-2">
            {products.map((p) => (
              <a
                key={p.id}
                href="/produits"
                className="flex items-center gap-3 rounded-2xl border border-[#D7EBDD] bg-white p-2 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <img src={p.image} alt={p.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="text-xs font-bold text-[#94720F]">{money(p.price)}</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {message.created_at && (
          <span className="mt-1 px-1 text-[10px] text-[#8A9D8E]">{formatTime(message.created_at)}</span>
        )}
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="cs-msg-in mx-auto max-w-md rounded-3xl border border-[#D7EBDD] bg-white p-6 text-center shadow-sm">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#E5F2E8] text-2xl">
        🌿
      </div>
      <h2 className="mt-3 font-serif text-lg font-bold">Bonjour, bienvenue !</h2>
      <div className="mt-3 space-y-2 text-sm leading-6 text-[#4F6657]">
        {WELCOME_LINES.map((line, index) => (
          <p
            key={line}
            className="cs-msg-in"
            style={{ animationDelay: `${0.2 + index * 0.25}s` }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}


function TypingRow() {
  return (
    <div className="cs-msg-in flex items-end gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#E5F2E8] text-[10px] font-bold text-[#2D6A4F]">✿</span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#D7EBDD] bg-white px-4 py-3 shadow-sm">
        <span className="cs-dot h-1.5 w-1.5 rounded-full bg-[#52B788]" />
        <span className="cs-dot h-1.5 w-1.5 rounded-full bg-[#52B788]" style={{ animationDelay: "0.15s" }} />
        <span className="cs-dot h-1.5 w-1.5 rounded-full bg-[#52B788]" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Liste des produits (ouverte par un bouton)                                */
/* -------------------------------------------------------------------------- */

function ProductsSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (product: Product) => void;
}) {
  const [rendered, setRendered] = useState(open);

  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    const timer = window.setTimeout(() => setRendered(false), 260);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="cs-products-title">
      <button
        type="button"
        aria-label="Fermer la liste"
        onClick={onClose}
        className={`absolute inset-0 bg-[#0F2D20]/50 backdrop-blur-sm ${open ? "cs-backdrop-in" : "cs-backdrop-out"}`}
      />

      <div
        className={`relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem] ${
          open ? "cs-sheet-in" : "cs-sheet-out"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-[#CFE6D6] sm:hidden" />

        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
          <div>
            <h2 id="cs-products-title" className="font-serif text-xl font-bold">Nos produits</h2>
            <p className="mt-0.5 text-xs text-[#668071]">Choisissez un produit pour demander conseil à Gnilane.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#CFE6D6] text-[#2D6A4F] transition hover:bg-[#EAF5ED]"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-5 pt-2">
          {PRODUCTS.map((product, index) => (
            <li
              key={product.id}
              className="cs-item flex items-center gap-3 rounded-2xl border border-[#E3EEE6] bg-white p-2.5"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <img src={product.image} alt={product.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs font-bold text-[#94720F]">{money(product.price)}</p>
                {product.available_on_order && <p className="text-[10px] font-semibold text-[#85670E]">Sur commande</p>}
              </div>
              <button
                type="button"
                onClick={() => onPick(product)}
                className="shrink-0 rounded-full bg-[#2D6A4F] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#1B4332]"
              >
                Demander
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Conversation                                                              */
/* -------------------------------------------------------------------------- */

function ChatView({ chat, onLogoClick }: { chat: ChatState; onLogoClick: () => void }) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [showName, setShowName] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { draft, setDraft, messages, sending, loadingMessages, error, loadError, sendText } = chat;

  const closeProducts = useCallback(() => setProductsOpen(false), []);

  const pickProduct = useCallback(
    (product: Product) => {
      setDraft(`Bonjour Gnilane, je voudrais un conseil sur « ${product.name} ». `);
      setProductsOpen(false);
      window.setTimeout(() => textareaRef.current?.focus(), 320);
    },
    [setDraft],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sending]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    void sendText(draft);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const canSend = !sending && draft.trim().length >= 2;
  const showSuggestions = !draft.trim() && !sending;
  const trimmedName = chat.customerName.trim();

  return (
    <main className="flex h-[100dvh] flex-col bg-[#F3F8F4] text-[#1B4332] sm:items-center sm:justify-center sm:p-4">
      <ChatStyles />

      <section className="flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden bg-white sm:h-[min(820px,calc(100dvh_-_2rem))] sm:rounded-[2rem] sm:border sm:border-[#DCE9DD] sm:shadow-2xl">
        {/* En-tête */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E3EEE6] px-4 py-3 sm:px-6 sm:py-4">
          <button type="button" onClick={onLogoClick} aria-label="Beauté Bio by Gnilane" className="flex min-w-0 items-center gap-3 text-left">
           <img
  src="/logo.jpg"
  alt="Logo Beauté Bio by Gnilane"
  className="h-11 w-11 shrink-0 rounded-full border-2 border-[#D4AF37] bg-white object-contain p-0.5 shadow-md"
/>
            <span className="min-w-0">
              <span className="block truncate font-serif text-base font-bold leading-tight">Beauté Bio by Gnilane</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#2D6A4F]">
                <span className="cs-online h-2 w-2 shrink-0 rounded-full bg-[#52B788]" />
                Conversation avec Gnilane
              </span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setProductsOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#1B4332]"
            >
              <ShoppingBag size={15} aria-hidden="true" />
              Produits
            </button>
            <a
              href="/"
              aria-label="Retour à la boutique"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#CFE6D6] text-[#2D6A4F] transition hover:bg-[#EAF5ED]"
            >
              <ArrowLeft size={16} />
            </a>
          </div>
        </header>

        {/* Messages */}
        <div className="cs-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#FAFDFB] px-4 py-5 sm:px-6" aria-live="polite">
          {loadingMessages && messages.length === 0 && (
            <div className="flex justify-center py-10">
              <span className="cs-spin h-6 w-6 rounded-full border-2 border-[#2D6A4F] border-t-transparent" />
            </div>
          )}

          {!loadingMessages && messages.length === 0 && <Welcome />}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {sending && <TypingRow />}

          {loadError && <p className="text-center text-xs text-[#789082]">{loadError}</p>}

          <div ref={bottomRef} />
        </div>

        {/* Saisie */}
        <div
          className="shrink-0 border-t border-[#E3EEE6] bg-white px-4 pt-3 sm:px-6"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          {error && (
            <p role="alert" className="cs-shake mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          {showSuggestions && (
            <div className="cs-scroll mb-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap" role="group" aria-label="Questions suggérées">
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendText(suggestion)}
                  className="cs-chip shrink-0 rounded-full border border-[#CFE6D6] bg-[#F4FAF5] px-3.5 py-2 text-left text-xs font-semibold leading-5 text-[#2D6A4F] transition hover:-translate-y-0.5 hover:border-[#2D6A4F] hover:bg-[#E5F2E8] active:scale-95"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-[#6B8B78]">
              <button type="button" onClick={() => setShowName((v) => !v)} className="font-semibold text-[#2D6A4F] hover:underline">
                {trimmedName ? `Au nom de ${trimmedName}` : "Ajouter mon prénom"}
              </button>
              <span className={draft.length > 1300 ? "font-semibold text-[#B45309]" : ""}>
                {draft.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>

            {showName && (
              <input
                autoFocus
                value={chat.customerName}
                onChange={(e) => chat.updateCustomerName(e.target.value)}
                placeholder="Votre prénom"
                aria-label="Votre prénom"
                maxLength={80}
                className="cs-pop mb-2 w-full rounded-xl border border-[#CFE6D6] px-3 py-2.5 text-sm outline-none focus:border-[#2D6A4F]"
              />
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-[#CFE6D6] bg-[#FBFEFC] p-2 transition focus-within:border-[#2D6A4F] focus-within:ring-4 focus-within:ring-[#2D6A4F]/10">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Écrivez votre message…"
                aria-label="Votre message"
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-[#1B4332] outline-none placeholder:text-[#91A398]"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Envoyer"
                className="cs-send grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2D6A4F] text-white shadow-md hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:bg-[#B7CFC0] disabled:shadow-none"
              >
                {sending ? <span className="cs-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" /> : <Send size={17} />}
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-[#8A9D8E]">
              Beaute bio by Gnilane à votre service.
            </p>
          </form>
        </div>
      </section>

      <ProductsSheet open={productsOpen} onClose={closeProducts} onPick={pickProduct} />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Espace Gnilane                                                            */
/* -------------------------------------------------------------------------- */

function AdminLoginModal({ admin }: { admin: ReturnType<typeof useAdmin> }) {
  const { closeLogin } = admin;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLogin();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLogin]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-title">
      <form onSubmit={admin.login} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#2D6A4F]">Accès réservé</p>
            <h2 id="admin-title" className="mt-1 font-serif text-2xl font-bold">Espace Gnilane</h2>
          </div>
          <button type="button" onClick={closeLogin} className="beauty-flat rounded-full px-3 py-2 text-xl text-[#668071] hover:bg-[#F0F6F0]" aria-label="Fermer">
            ×
          </button>
        </div>
        <p className="mb-4 text-sm text-[#668071]">Saisissez votre code administrateur à {PIN_LENGTH} chiffres.</p>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          pattern={`[0-9]{${PIN_LENGTH}}`}
          maxLength={PIN_LENGTH}
          value={admin.pin}
          onChange={(e) => admin.setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))}
          placeholder="••••••"
          aria-label="Code administrateur"
          className="w-full rounded-xl border border-[#CFE6D6] px-4 py-3 text-center text-2xl tracking-[.5em] outline-none focus:border-[#2D6A4F]"
        />
        {admin.error && <p role="alert" className="mt-3 text-xs text-red-600">{admin.error}</p>}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={closeLogin} className="flex-1 rounded-full border border-[#CFE6D6] px-4 py-3 text-sm font-bold text-[#2D6A4F]">
            Annuler
          </button>
          <button
            disabled={admin.loginLoading || admin.pin.length !== PIN_LENGTH}
            className="flex-1 rounded-full bg-[#2D6A4F] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {admin.loginLoading ? "Vérification…" : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminDashboard({ admin }: { admin: ReturnType<typeof useAdmin> }) {
  const { selected } = admin;

  return (
    <main className="beauty-app min-h-screen bg-[#F4FAF5] px-3 py-6 text-[#1B4332] sm:px-6">
      <AppStyles />
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.7rem] bg-[#1B4332] p-6 text-white shadow-lg">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#B7E4C7]">Beauté Bio by Gnilane</p>
            <h1 className="mt-2 font-serif text-3xl font-bold">Espace privé de Gnilane</h1>
            <p className="mt-1 text-sm text-[#E3F3E8]">Demandes et conversations individuelles des clientes.</p>
          </div>
          <button onClick={admin.logout} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#1B4332]">
            Quitter l&apos;administration
          </button>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {admin.stats.map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-[#D7EBDD] bg-white p-4">
              <p className="text-xs text-[#668071]">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {admin.error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{admin.error}</p>
        )}

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-3xl border border-[#D7EBDD] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold">Les clientes</h2>
              <button onClick={() => void admin.reload()} className="beauty-flat text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] hover:underline">Actualiser</button>
            </div>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto">
              {admin.items.length === 0 && (
                <p className="rounded-xl bg-[#F4FAF5] p-4 text-sm text-[#668071]">Aucune demande pour le moment.</p>
              )}
              {admin.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => admin.setSelectedId(item.id)}
                  aria-pressed={admin.selectedId === item.id}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    admin.selectedId === item.id
                      ? "border-[#2D6A4F] bg-[#EAF5ED]"
                      : "border-[#E3EEE6] hover:bg-[#F8FCF9]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{statusLabel(item.status)}</span>
                    <span className="text-[10px] text-[#789082]">{new Date(item.updated_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold">{item.last_user_question}</p>
                  <p className="mt-1 text-[10px] text-[#789082]">Conversation #{item.id.slice(0, 8)}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl border border-[#D7EBDD] bg-white p-4 shadow-sm sm:p-6">
            {!selected ? (
              <div className="grid min-h-72 place-items-center text-center text-sm text-[#668071]">
                Sélectionnez une conversation pour lire la demande.
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#E3EEE6] pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#2D6A4F]">Conversation privée</p>
                    <h2 className="mt-1 font-serif text-xl font-bold">Demande de la cliente</h2>
                    <p className="mt-2 text-sm text-[#668071]">
                      {statusLabel(selected.status)} · {new Date(selected.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void admin.deleteConversation(selected.id)}
                    disabled={admin.deletingId === selected.id}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                    {admin.deletingId === selected.id ? "Suppression…" : "Supprimer"}
                  </button>
                </div>

                <div className="max-h-[48vh] space-y-3 overflow-y-auto rounded-2xl bg-[#F8FCF9] p-3 sm:p-5">
                  {selected.messages.map((m) => (
                    <MessageBubble key={m.id} message={m} variant="admin" />
                  ))}
                </div>

                <form onSubmit={admin.submitAnswer} className="mt-4">
                  <label htmlFor="admin-answer" className="mb-2 block text-sm font-bold">
                    Votre réponse à cette cliente
                  </label>
                  <textarea
                    id="admin-answer"
                    value={admin.answer}
                    onChange={(e) => admin.setAnswer(e.target.value)}
                    maxLength={4000}
                    rows={4}
                    placeholder="Écrivez votre réponse personnalisée…"
                    className="w-full rounded-2xl border border-[#CFE6D6] p-4 text-sm outline-none focus:border-[#2D6A4F]"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#789082]">Votre réponse sera enregistrée dans l&apos;historique privé.</p>
                    <button
                      disabled={admin.busy || admin.answer.trim().length < 2}
                      className="beauty-shine rounded-full bg-[#2D6A4F] px-6 py-3 text-sm font-bold text-white hover:bg-[#1B4332] disabled:opacity-50"
                    >
                      {admin.busy ? "Envoi…" : "Envoyer la réponse"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ConseilsPage() {
  const chat = useCustomerChat();
  const admin = useAdmin();
  const handleLogoClick = useSecretClicks(admin.openLogin);

  if (admin.isAdmin) return <AdminDashboard admin={admin} />;

  return (
    <>
      <ChatView chat={chat} onLogoClick={handleLogoClick} />
      {admin.showLogin && <AdminLoginModal admin={admin} />}
    </>
  );
}