// ============================================
// CONFIGURATION GPS DE LA BOUTIQUE SOPE NABY
// ============================================

export const SHOP_LOCATION = {
  latitude: 14.433338,
  longitude: -16.954737,
};

// Vérification de la configuration GPS
export function isShopLocationConfigured(): boolean {
  return (
    Number.isFinite(SHOP_LOCATION.latitude) &&
    Number.isFinite(SHOP_LOCATION.longitude) &&
    SHOP_LOCATION.latitude !== 0 &&
    SHOP_LOCATION.longitude !== 0
  );
}

// ============================================
// TARIFS PROVISOIRES DE LIVRAISON EN FCFA
// ============================================

export const DELIVERY_PRICES = [
  { maxDistance: 3, price: 500 },
  { maxDistance: 5, price: 1000 },
  { maxDistance: 10, price: 1500 },
  { maxDistance: 15, price: 2000 },
  { maxDistance: 20, price: 2500 },
];

// ============================================
// CALCUL DU PRIX DE LIVRAISON
// ============================================

export function calculateDeliveryPrice(
  distanceKm: number
): number | null {
  // Vérification de la distance
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return null;
  }

  // Recherche du tarif correspondant à la distance
  const range = DELIVERY_PRICES.find(
    (item) => distanceKm <= item.maxDistance
  );

  // Distance supérieure à 20 km
  if (!range) {
    return null;
  }

  return range.price;
}