"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaiementSuccesPage() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const savedOrder = localStorage.getItem("pendingWaveOrder");

    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);

        if (order.total) {
          setTotal(order.total);
        }

        // Paiement terminé : on vide le panier
        localStorage.removeItem("cart");

        // On supprime également la commande temporaire
        localStorage.removeItem("pendingWaveOrder");
      } catch (error) {
        console.error(
          "Impossible de récupérer la commande :",
          error
        );
      }
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff9fb] px-5">
      <div className="w-full max-w-lg rounded-3xl border border-[#eadde5] bg-white p-8 text-center shadow-xl sm:p-12">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e5f8f2] text-4xl">
          ✓
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#c77d9b]">
          Paiement confirmé
        </p>

        <h1 className="mt-3 font-serif text-4xl text-[#18233b]">
          Merci Adama ❤️
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#68748b]">
          Votre paiement a été effectué avec succès.
          Votre commande a bien été prise en compte.
        </p>

        {total > 0 && (
          <div className="mt-7 rounded-2xl bg-[#f8e8ef] px-6 py-5">
            <p className="text-xs uppercase tracking-wider text-[#9b7180]">
              Montant payé
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#18233b]">
              {total.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <a
            href="https://wa.me/221776811311?text=Bonjour%20Adama%2C%20mon%20paiement%20vient%20d%27%C3%AAtre%20effectu%C3%A9.%20Merci."
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full bg-[#c77d9b] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#b56d8b]"
          >
            Confirmer aussi sur WhatsApp
          </a>

          <Link
            href="/produits"
            className="flex w-full items-center justify-center rounded-full border border-[#18233b] px-6 py-3.5 text-sm font-medium text-[#18233b] transition hover:bg-[#18233b] hover:text-white"
          >
            Continuer mes achats
          </Link>
        </div>

      </div>
    </main>
  );
}