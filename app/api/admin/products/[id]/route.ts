import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/conseil/admin-session";
import { supabaseAdmin } from "@/lib/conseil/supabase-admin";

export const runtime = "nodejs";

const BUCKET_NAME = "product-images";

function isAdmin() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

/**
 * Récupère le chemin réel d'une image dans Supabase Storage.
 * On ne supprime que les fichiers du dossier products/.
 */
function getStoragePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) return null;

    const expectedOrigin = new URL(supabaseUrl).origin;

    if (url.origin !== expectedOrigin) return null;

    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;

    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    const path = decodeURIComponent(
      url.pathname.substring(markerIndex + marker.length)
    );

    if (!path.startsWith("products/")) return null;

    return path;
  } catch {
    return null;
  }
}

type Context = {
  params: {
    id: string;
  };
};

/**
 * MODIFIER UN PRODUIT
 * Permet également de supprimer définitivement sa photo.
 */
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  if (!isAdmin()) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    for (const field of [
      "name",
      "slug",
      "description",
      "category_id",
      "active",
    ]) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    let shouldDeletePhoto = false;
    let oldImageUrl: string | null = null;

    // Gestion de la photo
    if ("image_url" in body) {
      if (body.image_url === "" || body.image_url === null) {
        shouldDeletePhoto = true;

        const { data: existingProduct, error: fetchError } =
          await supabaseAdmin
            .from("products")
            .select("image_url")
            .eq("id", params.id)
            .single();

        if (fetchError) {
          return NextResponse.json(
            { error: "Impossible de retrouver le produit." },
            { status: 404 }
          );
        }

        oldImageUrl = existingProduct.image_url;

        updates.image_url = null;
      } else if (typeof body.image_url === "string") {
        updates.image_url = body.image_url;
      } else {
        return NextResponse.json(
          { error: "Adresse de photo invalide." },
          { status: 400 }
        );
      }
    }

    // Validation du prix
    if ("price" in body) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { error: "Prix invalide." },
          { status: 400 }
        );
      }

      updates.price = price;
    }

    // Validation du stock
    if ("stock" in body) {
      const stock = Number(body.stock);

      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json(
          { error: "Stock invalide." },
          { status: 400 }
        );
      }

      updates.stock = stock;
    }

    updates.updated_at = new Date().toISOString();

    // Mise à jour du produit dans la base de données
    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Suppression définitive du fichier dans Supabase Storage
    let photoDeleted = false;
    let storageWarning: string | null = null;

    if (shouldDeletePhoto && oldImageUrl) {
      const storagePath = getStoragePath(oldImageUrl);

      if (storagePath) {
        const { error: deleteError } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([storagePath]);

        if (deleteError) {
          console.error(
            "ERREUR SUPPRESSION PHOTO :",
            deleteError
          );

          storageWarning =
            "La référence de la photo a été supprimée, mais le fichier est encore présent dans Supabase Storage.";
        } else {
          photoDeleted = true;
        }
      } else {
        // L'image n'appartient pas au dossier géré par cette API.
        // La référence en base est néanmoins supprimée.
        photoDeleted = true;
      }
    }

    return NextResponse.json({
      success: true,
      product: data,
      photo_deleted: photoDeleted,
      warning: storageWarning,
      message: shouldDeletePhoto
        ? "Photo retirée du produit."
        : "Produit modifié avec succès.",
    });
  } catch (error) {
    console.error("ERREUR MODIFICATION PRODUIT :", error);

    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }
}

/**
 * SUPPRIMER UN PRODUIT
 */
export async function DELETE(
  _request: NextRequest,
  { params }: Context
) {
  if (!isAdmin()) {
    return NextResponse.json(
      { error: "Accès refusé." },
      { status: 401 }
    );
  }

  try {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produit supprimé.",
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer ce produit." },
      { status: 500 }
    );
  }
}