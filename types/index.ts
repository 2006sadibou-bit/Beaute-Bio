export type ProductVariant = {
  name: string;
  price: number;
};

export type PackItem = {
  name: string;
  price: number;
};

export type ProductType = "simple" | "variant" | "pack";

export type Product = {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  type: ProductType;
  price?: number;
  variants?: ProductVariant[];
  packItems?: PackItem[];
  description?: string;
  stock: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
};

export type DeliveryZone = {
  id: string;
  name: string;
  fee: number;
  active: boolean;
};

export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  whatsapp: string | null;
  address: string;
  delivery_zone_id: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: "wave" | "other";
  payment_status: string;
  order_status: OrderStatus;
  whatsapp_message: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
  variantName?: string;
  unitPrice: number;
};