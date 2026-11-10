import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/conseil/admin-session";
import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";

function isAdmin() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

type Context = {
  params: { id: string };
};

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    for (const field of ["name", "slug", "description", "image_url", "category_id", "active"]) {
      if (field in body) updates[field] = body[field];
    }

    if ("price" in body) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
      }
      updates.price = price;
    }

    if ("stock" in body) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json({ error: "Stock invalide." }, { status: 400 });
      }
      updates.stock = stock;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}