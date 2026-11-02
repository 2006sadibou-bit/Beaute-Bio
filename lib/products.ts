import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types";

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data as Product;
}

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }
  return data as Category[];
}
