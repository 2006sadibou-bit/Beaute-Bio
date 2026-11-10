import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("products")
        .select("id,name,description,price,stock,image_url,created_at,categories(name)")
        .eq("active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("ERREUR PRODUITS PUBLICS :", error);
        return NextResponse.json({ products: [] });
    }

    const products = (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image_url || "/logo.jpg",
        stock: Number(p.stock) > 0,
        category: p.categories?.name || "Autres",
        description: p.description || undefined,
    }));

    return NextResponse.json({ products });
}