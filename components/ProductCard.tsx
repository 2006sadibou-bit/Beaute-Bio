export type Category = {

  id: string;

  name: string;

  slug: string;

  description: string | null;

  image_url: string | null;

  active: boolean;

};

export type Product = {

  id: string;

  name: string;

  slug: string;

  category_id: string;

  description: string;

  details?: string;

  price: number;

  stock: number;

  image_url: string | null;

  active: boolean;

  created_at: string;

  updated_at: string;

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

};