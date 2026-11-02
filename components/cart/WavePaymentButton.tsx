"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/config";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type WavePaymentButtonProps = {
  cart: CartItem[];
  customerName?: string;
  onPaymentConfirmed: () => void;
};

export default function WavePaymentButton({
  cart,
  onPaymentConfirmed,
}: WavePaymentButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showNotPaid, setShowNotPaid] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleWavePayment = () => {
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    if (!siteConfig.wavePaymentLink) {
      alert("Le lien de paiement Wave n'est pas configuré.");
      return;
    }

    setIsOpening(true);
    setShowNotPaid(false);

    window.open(
      siteConfig.wavePaymentLink,
      "_blank",
      "noopener,noreferrer"
    );

    setTimeout(() => {
      setIsOpening(false);
      setShowConfirmation(true);
    }, 1200);
  };

  const handlePaymentYes = () => {
    setShowConfirmation(false);
    setShowNotPaid(false);
    setShowThankYou(true);

    onPaymentConfirmed();
  };

  const handlePaymentNo = () => {
    setShowConfirmation(false);
    setShowNotPaid(true);
  };

  const continuePayment = () => {
    setShowNotPaid(false);
    handleWavePayment();
  };

  return (
    <>
      {/* BOUTON WAVE */}
      <button
        type="button"
        onClick={handleWavePayment}
        disabled={isOpening}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1dc7a0] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#16ad8b] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isOpening ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Ouverture de Wave...
          </>
        ) : (
          <>
            <span>💳</span>
            Payer avec Wave
          </>
        )}
      </button>

      {/* FENÊTRE DE CONFIRMATION */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8faf5] text-3xl">
              💳
            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#18233b]">
              Est-ce que vous avez payé l'argent ?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#68748b]">
              Après avoir effectué votre paiement sur Wave,
              indiquez-nous si le paiement a bien été effectué.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePaymentNo}
                className="rounded-full border border-[#eadde5] px-5 py-3 text-sm font-semibold text-[#18233b] transition hover:bg-[#fff9fb]"
              >
                Non
              </button>

              <button
                type="button"
                onClick={handlePaymentYes}
                className="rounded-full bg-[#1dc7a0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16ad8b]"
              >
                Oui, j'ai payé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAIEMENT NON EFFECTUÉ */}
      {showNotPaid && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3e8] text-3xl">
              💳
            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#18233b]">
              Paiement non effectué
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#68748b]">
              Aucun problème. Vous pouvez retourner sur Wave
              pour effectuer votre paiement.
            </p>

            <button
              type="button"
              onClick={continuePayment}
              className="mt-7 flex w-full items-center justify-center rounded-full bg-[#1dc7a0] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#16ad8b]"
            >
              💳 Revenir payer avec Wave
            </button>

            <button
              type="button"
              onClick={() => setShowNotPaid(false)}
              className="mt-3 text-xs text-[#8b8490] transition hover:text-[#18233b]"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MERCI */}
      {showThankYou && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8faf5] text-4xl">
              ✓
            </div>

            <h2 className="mt-6 font-serif text-3xl text-[#18233b]">
              Merci pour votre achat !
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#68748b]">
              Votre commande a bien été prise en compte.
              <br />
              Merci d'avoir choisi <strong>Sope Naby</strong>.
            </p>

            <button
              type="button"
              onClick={() => setShowThankYou(false)}
              className="mt-7 rounded-full bg-[#18233b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#c77d9b]"
            >
              Continuer
            </button>
          </div>
        </div>
      )}
    </>
  );
}