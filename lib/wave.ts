
const WAVE_API_URL = "https://api.wave.com/v1/checkout/sessions";

export async function createWaveCheckout(
  amount: number,
  clientReference: string
) {
  const apiKey = process.env.WAVE_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!apiKey) {
    throw new Error("WAVE_API_KEY est manquante.");
  }

  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL est manquante.");
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Le montant du paiement est invalide.");
  }

  const response = await fetch(WAVE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: "XOF",
      client_reference: clientReference,
      success_url: `${siteUrl}/paiement/succes`,
      error_url: `${siteUrl}/paiement/erreur`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Wave :", data);

    throw new Error(
      data?.message || "Impossible de créer le paiement Wave."
    );
  }

  if (!data.wave_launch_url) {
    throw new Error("Wave n'a pas retourné de lien de paiement.");
  }

  return data;
}
