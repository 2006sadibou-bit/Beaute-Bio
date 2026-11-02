
// Configuration centrale du site.

export const siteConfig = {
  shopName: "Sope Naby",
  sellerName: "Adama",

  whatsappNumber: "221776811311",

  wavePaymentLink:
    "https://pay.wave.com/m/M_sn_QAGBdcO8TG-6/c/sn/",

  currency: "FCFA",
};

// Construit un lien WhatsApp pré-rempli.
export function buildWhatsAppLink(message: string) {
  const encoded = encodeURIComponent(message);

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encoded}`;
}
