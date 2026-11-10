import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/conseil/admin-session";
import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";

function isAdmin() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export async function GET() {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 401 }
      );
    }

    const [products, categories] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .from("categories")
        .select("*")
        .order("name"),
    ]);

    if (products.error || categories.error) {
      console.error("ERREUR SUPABASE PRODUITS :", products.error);
      console.error("ERREUR SUPABASE CATEGORIES :", categories.error);

      return NextResponse.json(
        {
          error: "Erreur de lecture Supabase.",
          details: {
            products: products.error?.message || null,
            categories: categories.error?.message || null,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: products.data || [],
      categories: categories.data || [],
    });
  } catch (error) {
    console.error("ERREUR API PRODUITS :", error);

    return NextResponse.json(
      {
        error: "Erreur interne.",
        details:
          error instanceof Error ? error.message : "Erreur inconnue.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const slug = String(body.slug ?? "").trim();
    const description = String(body.description ?? "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const category_id = body.category_id || null;
    const image_url = body.image_url || null;

    if (
      !name ||
      !slug ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        { error: "Informations du produit invalides." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        slug,
        description,
        price,
        stock,
        category_id,
        image_url,
        active: body.active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("ERREUR AJOUT PRODUIT :", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { product: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERREUR API AJOUT :", error);

    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }
}