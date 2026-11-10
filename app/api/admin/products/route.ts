import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { supabaseAdmin } from "@/lib/conseil/supabase-admin";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminToken,
} from "@/lib/conseil/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   VÉRIFICATION ADMINISTRATEUR
========================================================= */

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) return false;

    return Boolean(await verifyAdminToken(token));
  } catch (error) {
    console.error("Erreur vérification administrateur :", error);
    return false;
  }
}

/* =========================================================
   GET : PRODUITS PUBLICS ET PRODUITS ADMINISTRATEUR
========================================================= */

export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();

    let query = supabaseAdmin
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        price,
        stock,
        image_url,
        category_id,
        active,
        created_at,
        categories(name)
      `)
      .order("created_at", { ascending: false });

    /*
      ADMINISTRATEUR :
      Tous les produits sont visibles, même les produits masqués.

      VISITEUR PUBLIC :
      Seuls les produits publiés sont visibles.
    */

    if (!isAdmin) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("ERREUR CHARGEMENT PRODUITS :", error);

      return NextResponse.json(
        { error: "Impossible de charger les produits." },
        { status: 500 }
      );
    }

    const products = (data ?? []).map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      image_url: product.image_url,
      category_id: product.category_id,
      category: product.categories?.name || "Autres",
      active: Boolean(product.active),
      created_at: product.created_at,
    }));

    /*
      Les catégories sont nécessaires au formulaire
      d'ajout et de modification dans l'administration.
    */

    let categories: any[] = [];

    if (isAdmin) {
      const { data: categoryData, error: categoryError } =
        await supabaseAdmin
          .from("categories")
          .select("id,name")
          .order("name", { ascending: true });

      if (categoryError) {
        console.error(
          "ERREUR CHARGEMENT CATÉGORIES :",
          categoryError
        );
      } else {
        categories = categoryData ?? [];
      }
    }

    return NextResponse.json({
      products,
      ...(isAdmin ? { categories } : {}),
    });
  } catch (error) {
    console.error("ERREUR API PRODUITS :", error);

    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST : AJOUTER UN PRODUIT
========================================================= */

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const slug =
      typeof body.slug === "string" ? body.slug.trim() : "";

    const price = Number(body.price);
    const stock = Number(body.stock);

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Le nom et l'identifiant du produit sont obligatoires." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        { error: "Le prix ou le stock est invalide." },
        { status: 400 }
      );
    }

    const productData = {
      name,
      slug,
      description: body.description || null,
      price,
      stock,
      image_url: body.image_url || null,
      category_id: body.category_id || null,
      active: body.active !== false,
    };

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error("ERREUR AJOUT PRODUIT :", error);

      return NextResponse.json(
        { error: error.message || "Impossible d'ajouter le produit." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Produit ajouté avec succès.",
        product: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERREUR POST PRODUIT :", error);

    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}